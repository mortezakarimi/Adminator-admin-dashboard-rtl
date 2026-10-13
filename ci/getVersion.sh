#!/usr/bin/env sh
#
# Print the version field from package.json.
#
# Uses node rather than sed: the previous `sed '...;t;d'` form relied on GNU
# sed's handling of a label-less `t`. On BSD/macOS sed it errored and printed
# nothing, and that empty string silently became the tag "v" downstream.
set -eu

node -p "require('./package.json').version"
