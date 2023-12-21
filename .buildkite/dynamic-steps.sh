#!/bin/bash

set -eu

echo << Command
  - label: 'Soft fail with custom gh commit status'
    command: "sleep 5 && make test"
    soft_fail: true
    notify:
    - github_commit_status:
        context: "Custom commit status test"

  - label: 'Hello'
    command: "echo hi"
Command
