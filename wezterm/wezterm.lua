-- Pull in the wezterm API
local wezterm = require('wezterm')

-- This will hold the configuration.
local config = wezterm.config_builder()

-- This is where you actually apply your config choices
config.font = wezterm.font_with_fallback(
  { 'Intel One Mono', { family = 'Symbols Nerd Font Mono', scale = 0.75 } }
)
config.enable_tab_bar = false
config.color_scheme = 'carbonfox'
config.line_height = 1.25
config.font_size = 15

-- and finally, return the configuration to wezterm
return config
