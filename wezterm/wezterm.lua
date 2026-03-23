-- Pull in the wezterm API
local wezterm = require('wezterm')
local act = wezterm.action

-- This will hold the configuration.
local config = wezterm.config_builder()

-- This is where you actually apply your config choices
config.font = wezterm.font_with_fallback(
  {
    {
      family = 'Monaspace Argon',
      weight = 'Medium',
      harfbuzz_features = {
        'calt=1',
        'liga=1',
        'ss01=1',
        'ss02=1',
        'ss03=1',
        'ss04=0',
        'ss05=1',
        'ss06=0',
        'ss07=1',
        'ss08=0',
        'ss09=1',
      }
    }
  }
)
config.enable_tab_bar = false
config.color_scheme = 'Tomorrow Night (Gogh)'
config.line_height = 1.50
config.font_size = 15

-- Clipboard configuration for tmux integration
config.enable_csi_u_key_encoding = false

config.keys = {
  -- Option+Left/Right: word navigation (Alt+b / Alt+f)
  -- Works in both tmux and regular WezTerm sessions
  {
    key = 'LeftArrow',
    mods = 'OPT',
    action = act.SendKey { key = 'b', mods = 'ALT' },
  },
  {
    key = 'RightArrow',
    mods = 'OPT',
    action = act.SendKey { key = 'f', mods = 'ALT' },
  },
  -- Cmd+V: Conditional - tmux paste in tmux, native paste elsewhere
  {
    key = 'v',
    mods = 'CMD',
    action = wezterm.action_callback(function(window, pane)
      if os.getenv('TMUX') then
        -- In tmux: send prefix + P
        window:perform_action(act.Multiple {
          act.SendKey { key = 'a', mods = 'CTRL' },
          act.SendKey { key = 'P' },
        }, pane)
      else
        -- Not in tmux: native paste
        window:perform_action(act.PasteFrom 'Clipboard', pane)
      end
    end),
  },
  -- Cmd+C: Send to application
  {
    key = 'c',
    mods = 'CMD',
    action = act.CopyTo 'ClipboardAndPrimarySelection',
  },
}

-- and finally, return the configuration to wezterm
return config
