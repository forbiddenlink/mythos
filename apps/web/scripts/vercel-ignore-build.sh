#!/usr/bin/env bash
# Vercel "ignored build step": exit 0 skips the build, exit 1 builds.
# Any other exit code fails the deployment, so every path below ends in 0 or 1.

# Keep previews opt-in for changes that need testing on Vercel.
if [ "$VERCEL_ENV" != production ]; then
  case "$VERCEL_ENV:$VERCEL_GIT_COMMIT_MESSAGE" in
    preview:*"[preview]"*) exit 1 ;;
    *) exit 0 ;;
  esac
fi

# Release Please commits only touch the version and changelog.
case "$VERCEL_GIT_COMMIT_MESSAGE" in "chore(main): release"*) exit 0 ;; esac

cd "$(git rev-parse --show-toplevel)" || exit 1
base="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"

# Vercel clones shallow, so the last deployed commit can be missing. Comparing
# against it then errors and fails the deploy; build instead.
git cat-file -e "${base}^{commit}" 2>/dev/null || exit 1

git diff --quiet "$base" HEAD -- . ':!*.md' ':!.github' ':!docs' && exit 0
exit 1
