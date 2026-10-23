import importlib.util
import json
import os
import signal
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location(
    "refresh_runner", Path(__file__).parents[1] / "scripts/run-refresh.py"
)
assert SPEC is not None and SPEC.loader is not None
RUNNER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RUNNER)


class RefreshRunnerTests(unittest.TestCase):
    def test_timeout_kills_children_after_the_parent_exits(self) -> None:
        with tempfile.TemporaryDirectory(prefix="tickerfc-child-test-") as directory:
            root = Path(directory)
            prompt = root / "prompt.txt"
            prompt.write_text("fixture input")
            pid_file = root / "child.pid"
            child = (
                "import os,signal,sys,time; from pathlib import Path; "
                "signal.signal(signal.SIGTERM,signal.SIG_IGN); "
                "Path(sys.argv[1]).write_text(str(os.getpid())); time.sleep(30)"
            )
            parent = (
                "import subprocess,sys,time; "
                "subprocess.Popen([sys.executable,'-c',sys.argv[1],sys.argv[2]]); "
                "time.sleep(30)"
            )
            try:
                result = RUNNER.run_refresh(
                    [sys.executable, "-c", parent, child, str(pid_file)], prompt, root, 1
                )
                self.assertEqual(result, 124)
                child_pid = int(pid_file.read_text())
                status = subprocess.run(
                    ["ps", "-p", str(child_pid), "-o", "stat="],
                    capture_output=True,
                    text=True,
                    timeout=5,
                ).stdout.strip()
                self.assertTrue(not status or status.startswith("Z"), status)
            finally:
                if pid_file.exists():
                    try:
                        os.kill(int(pid_file.read_text()), signal.SIGKILL)
                    except ProcessLookupError:
                        pass

    def test_exit_codes_and_deadline_are_preserved(self) -> None:
        with tempfile.TemporaryDirectory(prefix="tickerfc-test-") as directory:
            root = Path(directory)
            prompt = root / "prompt.txt"
            prompt.write_text("fixture input")
            for code in (0, 7):
                with self.subTest(exit_code=code):
                    result = RUNNER.run_refresh(
                        [sys.executable, "-c", f"import sys; sys.exit({code})"],
                        prompt,
                        root,
                        5,
                    )
                    state = json.loads((root / "status.json").read_text())
                    self.assertEqual(result, code)
                    self.assertEqual(state["exitCode"], code)
                    self.assertEqual(state["status"], "completed" if code == 0 else "failed")
            result = RUNNER.run_refresh(
                [sys.executable, "-c", "import time; time.sleep(30)"], prompt, root, 1
            )
            state = json.loads((root / "status.json").read_text())
            self.assertEqual(result, 124)
            self.assertEqual(state["status"], "timed_out")


if __name__ == "__main__":
    unittest.main()
