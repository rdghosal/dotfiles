PACKAGES := bat dunst git gtk i3 kitty nvim pi profile rofi tmux xresources zsh

.PHONY: install force-install uninstall restow list

install:
	@for pkg in $(PACKAGES); do \
		echo "stow $$pkg"; \
		stow -t $$HOME -R $$pkg; \
	done

# Removes conflicting real files at $HOME first, then stows.
# Only touches files that the package would link — $HOME files outside the
# package's tree (e.g. ~/.config/nvim/lazy/) are left alone.
force-install:
	@for pkg in $(PACKAGES); do \
		echo "force-stow $$pkg"; \
		( cd $$pkg && find . \( -type f -o -type l \) ! -name .stow-local-ignore -print | while read f; do \
			target="$$HOME/$${f#./}"; \
			if [ -e "$$target" ] && [ ! -L "$$target" ]; then rm -f "$$target"; fi; \
		done ); \
		stow -t $$HOME -R $$pkg; \
	done

uninstall:
	@for pkg in $(PACKAGES); do stow -t $$HOME -D $$pkg; done

restow: install

list:
	@echo $(PACKAGES)
