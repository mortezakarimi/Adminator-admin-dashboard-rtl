#!/usr/bin/env sh
#
# Fail the build when the tag we are about to cut already exists on origin,
# so a release never silently overwrites a published one.
set -eu

VERSION=${1:-}

# Guard against an empty or malformed version. Without this, a failure in
# getVersion.sh produced the tag "v" — which of course does not exist yet, so
# the check passed and the release would have gone out mis-tagged.
case "$VERSION" in
  v[0-9]*.[0-9]*.[0-9]*) ;;
  *)
    echo "Refusing to continue: '$VERSION' is not a vMAJOR.MINOR.PATCH tag."
    exit 1
    ;;
esac

TAG_EXISTS=$(git ls-remote --tags origin "$VERSION" | wc -l)

if [ "$TAG_EXISTS" -ne 0 ]; then
  echo "The tag '$VERSION' already exists. Please update version in package.json."
  exit 1
fi

echo "The tag '$VERSION' does not exist - success."
