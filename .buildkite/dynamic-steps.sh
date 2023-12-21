#!/bin/bash

set -eu

echo "  - label: 'Soft fail with custom gh commit status'"
echo "    command: \"sleep 5 && make test\""
echo "    soft_fail: true"
echo "    notify:"
echo "    - github_commit_status:"
echo "        context: \"Custom commit status test\""
echo "  - label: 'Hello'"
echo "    command: \"echo hi\""
