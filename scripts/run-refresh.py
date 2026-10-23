#!/usr/bin/env python3
"""Bound the existing monthly refresh and retain its outcome across reboots."""

import argparse
import fcntl
import json
import os
import shutil
import signal
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


def write_status(path: Path, state: dict[str, object]) -> None:
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(state, indent=2) + "\n")
    temporary.replace(path)


def run_refresh(command: list[str], prompt: Path, log_dir: Path, timeout: int) -> int:
    os.umask(0o077)
    log_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (log_dir / "refresh.lock").open("a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("Refresh already running; skipped.", flush=True)
            return 75
        started = datetime.now(timezone.utc)
        state: dict[str, object] = {
            "startedAt": started.isoformat(),
            "deadlineAt": (started + timedelta(seconds=timeout)).isoformat(),
            "status": "running",
        }
        status_file = log_dir / "status.json"
        write_status(status_file, state)
        print(f'{started.isoformat()} refresh starting; deadline {state["deadlineAt"]}', flush=True)
        try:
            with prompt.open() as source:
                process = subprocess.Popen(command, stdin=source, start_new_session=True)
                try:
                    code = process.wait(timeout=timeout)
                except subprocess.TimeoutExpired:
                    try:
                        os.killpg(process.pid, signal.SIGTERM)
                    except ProcessLookupError:
                        pass
                    try:
                        process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        pass
                    try:
                        os.killpg(process.pid, signal.SIGKILL)
                    except ProcessLookupError:
                        pass
                    process.wait(timeout=5)
                    code = 124
        except OSError as error:
            print(f"Refresh could not start: {error}", file=sys.stderr, flush=True)
            code = 1
        state.update(
            {
                "finishedAt": datetime.now(timezone.utc).isoformat(),
                "exitCode": code,
                "status": "timed_out" if code == 124 else "completed" if code == 0 else "failed",
            }
        )
        write_status(status_file, state)
        print(f'{state["finishedAt"]} refresh {state["status"]}; exit code {code}', flush=True)
        return code


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--check", action="store_true", help="Validate paths without running the AI job"
    )
    args = parser.parse_args()
    prompt = Path.home() / "bin/tickerfc-refresh-prompt.md"
    cli = shutil.which("claude")
    if not cli or not prompt.is_file():
        print("Refresh unavailable: Claude executable or prompt is missing.", file=sys.stderr)
        return 1
    if args.check:
        print("Refresh preflight OK; no AI request or deployment was run.")
        return 0
    log_dir = Path.home() / "Library/Logs/ticker-fc"
    return run_refresh(
        [cli, "-p", "--dangerously-skip-permissions", "--model", "claude-opus-5"],
        prompt,
        log_dir,
        timeout=1800,
    )


if __name__ == "__main__":
    sys.exit(main())
