#!/usr/bin/env bash
# Wrapper delegating to bin/localmind
cd "$(dirname "$0")"
exec ./bin/localmind stop "$@"
