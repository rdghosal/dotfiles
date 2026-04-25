#!/bin/bash
exec 2>>/tmp/pop.log
set -x

AS=/usr/local/bin/aerospace
MONITOR=$($AS list-monitors --focused --format '%{monitor-name}')

case "$MONITOR" in
  *Built-in* | *Retina*)
    W=1200
    H=820 # 17" MBP — comfortable reading width
    ;;
  *)
    W=2000
    H=2000 # 34" ultrawide — generous but still leaves big margins
    ;;
esac

$AS fullscreen off 2>/dev/null || true
$AS layout floating

sleep 0.1

# Resize, then center on whichever screen the window is currently on
osascript -l JavaScript <<EOF
ObjC.import('AppKit');
const se = Application('System Events');
const proc = se.processes.whose({frontmost: true})[0];
const wins = proc.windows.whose({focused: true});
const win = wins.length > 0 ? wins[0] : proc.windows[0];

win.size = [$W, $H];

const pos = win.position();
const screens = \$.NSScreen.screens;
let target = \$.NSScreen.mainScreen;
for (let i = 0; i < screens.count; i++) {
  const s = screens.objectAtIndex(i);
  const f = s.frame;
  if (pos[0] >= f.origin.x && pos[0] < f.origin.x + f.size.width) {
    target = s;
    break;
  }
}
const f = target.frame;
win.position = [
  f.origin.x + (f.size.width  - $W) / 2,
  f.origin.y + (f.size.height - $H) / 2
];
EOF
