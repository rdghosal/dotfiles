-- Pull in the wezterm API
local wezterm = require('wezterm')

-- This will hold the configuration.
local config = wezterm.config_builder()


-- This is where you actually apply your config choices
config.font = wezterm.font('Intel One Mono')
config.enable_tab_bar = false
config.color_scheme = 'Tokyo Night'
config.line_height = 1.20
config.font_size = 15

-- and finally, return the configuration to wezterm
return config
