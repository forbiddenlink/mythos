"""Exercise the real override gate against small pnpm lockfile fixtures."""
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).with_name("verify-overrides.sh").resolve()


class OverrideGateTests(unittest.TestCase):
    def check(self, overrides, packages, expected_status):
        with tempfile.TemporaryDirectory(prefix="mythos-override-") as directory:
            root = Path(directory)
            (root / "package.json").write_text(json.dumps({"pnpm": {"overrides": overrides}}))
            (root / "pnpm-lock.yaml").write_text(
                "lockfileVersion: '9.0'\noverrides:\n"
                + "".join(f"  '{key}': '{value}'\n" for key, value in overrides.items())
                + "packages:\n"
                + "".join(f"  '{package}': {{}}\n" for package in packages)
            )
            result = subprocess.run(["bash", str(SCRIPT), directory], capture_output=True, text=True)
            self.assertEqual(result.returncode, expected_status, result.stdout + result.stderr)

    def test_rejects_vulnerable_duplicate_in_same_major(self):
        self.check({"undici": ">=7.29.1 <8"}, ["undici@7.0.0", "undici@7.29.1"], 1)

    def test_rejects_vulnerable_range_selected_version(self):
        self.check({"postcss-selector-parser@<7.1.6": ">=7.1.6 <8"}, ["postcss-selector-parser@7.1.0"], 1)

    def test_rejects_vulnerable_bounded_range_selected_version(self):
        self.check({"minimatch@>=5.0.0 <5.1.8": ">=5.1.8 <6"}, ["minimatch@5.1.0", "minimatch@9.0.7"], 1)

    def test_rejects_vulnerable_scoped_package(self):
        self.check({"@babel/core": ">=7.29.1"}, ["@babel/core@7.0.0", "@babel/core@7.29.1"], 1)

    def test_does_not_apply_major_pin_to_other_major(self):
        self.check({"brace-expansion@2": ">=2.1.7 <3"}, ["brace-expansion@1.1.12", "brace-expansion@2.1.7"], 0)

    def test_accepts_patched_versions_outside_original_vulnerable_range(self):
        self.check({"postcss-selector-parser@<7.1.6": ">=7.1.6 <8"}, ["postcss-selector-parser@7.1.6"], 0)

    def test_accepts_multiple_safe_versions(self):
        self.check({"undici": ">=7.29.1 <8"}, ["undici@7.29.1", "undici@7.30.0"], 0)


if __name__ == "__main__":
    unittest.main()
