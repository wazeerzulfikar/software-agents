#!/bin/bash
# The Original Agents: opens the exhibit full-screen in Google Chrome.
# Double-click this file. To leave the exhibit, press Command-Q.
cd "$(dirname "$0")" || exit 1
open -na "Google Chrome" --args \
  --kiosk \
  --user-data-dir="${TMPDIR:-/tmp}/original-agents-kiosk" \
  --no-first-run --no-default-browser-check \
  --disable-pinch --overscroll-history-navigation=0 \
  --disable-features=Translate \
  "file://$PWD/index.html"
