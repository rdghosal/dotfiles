# Plan: Skills as a Separate Project

## Goal

Manage skills as a standalone project at `~/code/skills` that:

1.  Is its own Git repository for independent versioning
2.  Is publishable as an NPM package for distribution
3.  Symlinks to multiple agentic tools (pi, opencode, etc.)
4.  Has its own pre-commit configuration for skill-specific linting

## Current State

- **Skills location:** `~/.config/pi/agent/skills/` (12 skills)
- 19 `.md` files (SKILL.md + references)
- 2 `.sh` files (tmux skill scripts)
- **Dotfiles repo:** `git@github.com:rdghosal/dotfiles.git`
- **Pre-commit config:** `~/.config/.pre-commit-config.yaml`
- **Markdownlint config:** `~/.config/.markdownlint.yaml`
- **Other tools:** `~/.config/opencode/` (no skills directory yet)

## Pre-Commit Analysis

### Current dotfiles pre-commit hooks

| Hook | Scope | After Migration |
|------|-------|-----------------|
| trailing-whitespace | All files | **Keep** in dotfiles |
| end-of-file-fixer | All files | **Keep** in dotfiles |
| check-yaml/json/toml | Config files | **Keep** in dotfiles |
| check-merge-conflict | All files | **Keep** in dotfiles |
| check-case-conflict | All files | **Keep** in dotfiles |
| detect-private-key | All files | **Keep** in dotfiles |
| check-executables/shebangs | Shell scripts | **Keep** in dotfiles |
| **prettier** | JS/TS/JSON/MD | **Keep** in dotfiles (for extensions), remove markdown |
| **eslint** | pi/agent/extensions | **Keep** in dotfiles |
| shellcheck | Shell scripts | **Keep** in dotfiles (zsh) |
| shfmt | Shell scripts | **Keep** in dotfiles (zsh) |
| stylua | nvim Lua | **Keep** in dotfiles |
| ruff/mypy | Python | **Keep** in dotfiles |
| **markdownlint** | Markdown | **Keep** in dotfiles, **copy** to skills |

### Skills project needs

| Hook | Reason |
|------|--------|
| markdownlint | 19 `.md` files (SKILL.md + references) |
| shellcheck | 2 `.sh` files (tmux scripts) |
| shfmt | 2 `.sh` files (tmux scripts) |
| trailing-whitespace | General hygiene |
| end-of-file-fixer | General hygiene |

---

## Target Architecture

```
~/code/skills/                    # Git repo + NPM package
├── .pre-commit-config.yaml       # Skills-specific hooks
├── .markdownlint.yaml            # Markdown linting config
├── package.json
├── README.md
├── .gitignore
├── design-an-interface/
│   └── SKILL.md
├── grill-me/
│   └── SKILL.md
├── ...
└── tmux/
    ├── SKILL.md
    └── scripts/
        ├── wait-for-text.sh
        └── find-sessions.sh

~/.config/pi/agent/skills → ~/code/skills      # Symlink
~/.config/opencode/skills → ~/code/skills      # Symlink
```

---

## Phase 1: Create the Skills Repository

### Step 1.1: Create GitHub repository

- [ ] Create new repo at `github.com/rdghosal/skills` (empty, no README)
- [ ] Note the SSH URL: `git@github.com:rdghosal/skills.git`

### Step 1.2: Initialize local repository

```bash
mkdir -p ~/code/skills
cd ~/code/skills
git init

# Copy existing skills from pi config
cp -r ~/.config/pi/agent/skills/* .

# Create package.json for NPM publishing
cat > package.json << 'EOF'
{
  "name": "@rdghosal/skills",
  "version": "1.0.0",
  "description": "Agent skills for pi, opencode, and other AI coding assistants",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rdghosal/skills.git"
  },
  "keywords": ["agent", "skills", "pi", "opencode", "ai", "coding-assistant"]
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.DS_Store
*.log
EOF
```

### Step 1.3: Create pre-commit configuration for skills

```bash
cat > .pre-commit-config.yaml << 'EOF'
# Pre-commit configuration for skills repository
# See https://pre-commit.com for more information

repos:
  # General file checks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
        args: [--markdown-linebreak-ext=md]
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: check-case-conflict
      - id: detect-private-key
      - id: check-executables-have-shebangs
      - id: check-shebang-scripts-are-executable

  # Markdown linting
  - repo: https://github.com/igorshubovych/markdownlint-cli
    rev: v0.44.0
    hooks:
      - id: markdownlint
        args: [--fix, --config, .markdownlint.yaml, --]

  # Shell script linting and formatting
  - repo: https://github.com/shellcheck-py/shellcheck-py
    rev: v0.10.0.1
    hooks:
      - id: shellcheck
        args: [--severity=warning]

  - repo: https://github.com/scop/pre-commit-shfmt
    rev: v3.11.0-1
    hooks:
      - id: shfmt
        args: [-i=2, -ci, -w]

ci:
  autofix_commit_msg: |
    [pre-commit.ci] auto fixes from pre-commit.com hooks
  autofix_prs: true
  autoupdate_schedule: weekly
EOF

# Copy markdownlint config from dotfiles
cp ~/.config/.markdownlint.yaml .
```

### Step 1.4: Create README

```bash
cat > README.md << 'EOF'
# Skills

Agent skills for AI coding assistants.

## Installation

### Clone and symlink (recommended for personal use)
```bash
git clone git@github.com:rdghosal/skills.git ~/code/skills
ln -s ~/code/skills ~/.config/pi/agent/skills
ln -s ~/code/skills ~/.config/opencode/skills
```

### As an NPM Package

```bash
npm install @rdghosal/skills
```

## Skills

| Skill | Description |
|-------|-------------|
| design-an-interface | Generate multiple radically different interface designs |
| grill-me | Interview user relentlessly about a plan or design |
| improve-codebase-architecture | Find architectural improvement opportunities |
| prd-to-plan | Turn a PRD into a multi-phase implementation plan |
| prd-to-todos | Break a PRD into independently-grabbable todos |
| review-and-commit | Review code and organize commits |
| tdd | Test-driven development with red-green-refactor loop |
| tmux | Remote control tmux sessions |
| update-changelog | Update changelogs following conventions |
| uv | Use uv instead of pip/python/venv |
| write-a-prd | Create a PRD through user interview |

## Development

Install pre-commit hooks:

```bash
pre-commit install
pre-commit run --all-files
```

EOF

# Commit and push

git add .
git commit -m "feat: initial skills import with pre-commit config"
git branch -M main
git remote add origin <git@github.com>:rdghosal/skills.git
git push -u origin main

```

---

## Phase 2: Replace pi/agent/skills with Symlink

### Step 2.1: Remove existing skills directory
```bash
# Safety: verify skills were copied successfully first
ls ~/code/skills/

# Remove the old directory
rm -rf ~/.config/pi/agent/skills
```

### Step 2.2: Create symlink

```bash
ln -s ~/code/skills ~/.config/pi/agent/skills
```

### Step 2.3: Update dotfiles repo

```bash
cd ~/.config/pi
git add agent/skills
git commit -m "refactor(skills): move to ~/code/skills, symlink for reuse"
git push
```

---

## Phase 3: Set Up Cross-Tool Symlinks

### Step 3.1: Symlink for opencode

```bash
ln -s ~/code/skills ~/.config/opencode/skills
```

### Step 3.2: Verify opencode discovers skills

- [ ] Check opencode documentation for skill discovery paths
- [ ] If needed, add skills path to opencode config

---

## Phase 4: Update Dotfiles Pre-Commit

### Step 4.1: Update prettier scope

Remove markdown from prettier (skills are now external with their own config):

```yaml
# In ~/.config/.pre-commit-config.yaml
# Change prettier hook from:
- id: prettier
  types_or: [javascript, jsx, ts, tsx, json, markdown]

# To:
- id: prettier
  types_or: [javascript, jsx, ts, tsx, json]
```

### Step 4.2: Keep markdownlint in dotfiles

Dotfiles still has 700+ markdown files (READMEs, config docs, etc.). Keep:

- `markdownlint` hook in `.pre-commit-config.yaml`
- `.markdownlint.yaml` config file

The skills repo gets its own **copy** of `.markdownlint.yaml`.

### Step 4.3: Commit changes

```bash
cd ~/.config
git add .pre-commit-config.yaml
git commit -m "refactor(pre-commit): remove markdown from prettier scope (skills external)"
git push
```

---

## Verification Checklist

After completion:

- [ ] `~/code/skills` is a git repository with all 12 skills
- [ ] `~/code/skills/.pre-commit-config.yaml` exists with markdown/shell hooks
- [ ] `~/code/skills/.markdownlint.yaml` exists (copied from dotfiles)
- [ ] `~/.config/pi/agent/skills` is a symlink pointing to `~/code/skills`
- [ ] `~/.config/opencode/skills` is a symlink pointing to `~/code/skills`
- [ ] All 12 skills still load correctly in pi
- [ ] `git status` in dotfiles shows clean working tree
- [ ] `ls -la ~/.config/pi/agent/skills` shows symlink arrow
- [ ] Dotfiles `.pre-commit-config.yaml` still has markdownlint
- [ ] Dotfiles `.markdownlint.yaml` still exists
- [ ] Dotfiles prettier no longer includes markdown in types_or

---

## Future Workflow

### Updating skills

```bash
cd ~/code/skills
# Make changes...
git add .
git commit -m "feat(skill): add new capability"
git push
```

### Running pre-commit in skills

```bash
cd ~/code/skills
pre-commit run --all-files
```

### Setting up on a new machine

```bash
# Clone skills repo
git clone git@github.com:rdghosal/skills.git ~/code/skills

# Install pre-commit hooks
cd ~/code/skills
pre-commit install

# Create symlinks
ln -s ~/code/skills ~/.config/pi/agent/skills
ln -s ~/code/skills ~/.config/opencode/skills
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Skills lost during migration | Verify `~/code/skills` has all 12 skills before removing old dir |
| Symlink breaks on new machine | Document setup in dotfiles README |
| Opencode skill discovery differs | Verify opencode docs; may need config adjustment |
| Pre-commit hooks conflict | Skills repo has its own isolated pre-commit config |

---

## Estimated Time

- Phase 1: 7 minutes
- Phase 2: 2 minutes
- Phase 3: 1 minute
- Phase 4: 3 minutes
- **Total: ~15 minutes**
