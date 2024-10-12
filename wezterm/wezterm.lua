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

config.keys = {
  {
    key = 'LeftArrow',
    mod = 'OPT',
    action = act.SendKey {
      key = 'b',
      mods = 'ALT',
    }
  },
  {
    key = 'RightArrow',
    mod = 'OPT',
    action = act.SendKey {
      key = 'f',
      mods = 'ALT',
    }
  }
}

-- and finally, return the configuration to wezterm
return config
