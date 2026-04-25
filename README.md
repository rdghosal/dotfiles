# dotfiles

Managed with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level package mirrors the layout it should land in under `$HOME`.

## Setup on a new machine

```sh
git clone <repo> ~/code/dotfiles
cd ~/code/dotfiles
make install
```

`make install` runs `stow -t $HOME -R <pkg>` for each package below. `make uninstall` removes the symlinks. `make restow` is alias for `install`.

## Stowed packages

| Package | Lands at |
|---------|----------|
| `bat`   | `~/.config/bat/` |
| `git`   | `~/.config/git/ignore` (global gitignore, auto-read by git) |
| `kitty` | `~/.config/kitty/` |
| `nvim`  | `~/.config/nvim/` |
| `pi`    | `~/.config/pi/agent/` |
| `tmux`  | `~/.config/tmux/tmux.conf` (tmux 3.1+) |
| `zsh`   | `~/.zshenv` (sets `ZDOTDIR`) + `~/.config/zsh/.zshrc` |

## Not stowed (kept in repo as reference / manual setup)

- `aerospace`, `alacritty`, `ghostty`, `helix`, `opencode`, `wezterm`, `zed` — not yet migrated to the stow layout.
- `iterm2/` — iTerm2 stores prefs in a binary plist; sync manually:
  ```sh
  defaults export com.googlecode.iterm2 ~/code/dotfiles/iterm2/com.googlecode.iterm2.plist
  defaults import com.googlecode.iterm2 ~/code/dotfiles/iterm2/com.googlecode.iterm2.plist
  ```
- `secrets/` — machine-local; `.gitignore` excludes `secrets/op*`.
- `pi/.config/pi/agent/{extensions,security}` — absolute symlinks into `~/code/agentish/`. Excluded by `.stow-local-ignore`. Re-create per machine.

## First launch on a new machine — Neovim plugin pinning

`nvim/.config/nvim/lazy-lock.json` pins every plugin to an exact commit SHA.

```sh
make install     # places symlinks; ~/.config/nvim/lazy-lock.json points into repo
nvim             # lazy.nvim self-bootstraps, installs every plugin at the SHA pinned in lazy-lock.json
```

Inside nvim:

```
:Lazy restore    # belt-and-braces: hard checkout to lockfile SHAs (overrides floating version/branch/tag specs)
:qa
```

Do **not** run `:Lazy update` or `:Lazy sync` unless intentionally bumping pins — those rewrite `lazy-lock.json` through the symlink and edit the repo file. To bump: `:Lazy update`, review `git diff nvim/.config/nvim/lazy-lock.json`, commit.

Mason packages (LSPs, formatters, linters) and Treesitter parsers are out of scope: those install at runtime per machine and `lazy-lock.json` does not pin them.

## Verifying changes

```sh
for p in bat git kitty nvim pi tmux zsh; do
  echo "=== $p ==="
  stow -n -v -t ~ "$p"
done
```

Dry run only — prints planned `LINK:` lines and any conflicts.

### Resolving conflicts

A conflict means a real file already exists at the target path. Three options:

- **`make force-install`** — for each package, removes any conflicting real file at the target and then stows. **Repo wins.** Only touches files the package owns; `~/.config/nvim/lazy/` and other unrelated `$HOME` files are not affected. Use when the repo is the source of truth.
- **`stow --adopt -t ~ <pkg>`** — moves the target file's content into the repo (overwriting the repo file) and replaces the target with a symlink. **Home wins.** Diff first: `diff ~/.config/<app>/<file> <pkg>/.config/<app>/<file>`.
- **Manual rename** — `mv ~/.config/<app>/<file>{,.bak}`, then `make install`.

### Ignore lists

`pi/.stow-local-ignore` excludes `extensions` and `security` (absolute symlinks into `~/code/agentish/`) so stow does not try to recreate them in `~/.config/pi/agent/`. GNU Stow reads `.stow-local-ignore` from each *package* directory, not the stow root.
