#!/bin/bash

set -eu

echo "  - label: 'Soft fail with custom gh commit status'"
echo "    command: \"sleep 1 && make test\""
echo "    soft_fail: true"
# echo "    notify:"
# echo "    - slack: \"#some-channel\""
# echo "      if: build.state == 'failed'"
# echo "    - github_commit_status:"
# echo "        context: \"Custom commit status test\""
echo "  - label: 'Hello'"
echo "    command: \"echo hi\""
