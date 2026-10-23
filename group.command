#!/bin/bash
# Pattie Maes and her group: opens the timeline full-screen in Google Chrome,
# with the music allowed to start on its own. Double-click this file.
# To leave, press Command-Q.
cd "$(dirname "$0")" || exit 1
open -na "Google Chrome" --args \
  --kiosk \
  --user-data-dir="${TMPDIR:-/tmp}/original-agents-group-kiosk" \
  --no-first-run --no-default-browser-check \
  --autoplay-policy=no-user-gesture-required \
  --disable-pinch --overscroll-history-navigation=0 \
  --disable-features=Translate \
  "file://$PWD/group.html"
