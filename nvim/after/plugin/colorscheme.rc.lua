require("tokyonight").setup({
    -- your configuration comes here
    -- or leave it empty to use the default settings
    style = "storm",         -- The theme comes in three styles, `storm`, `moon`, a darker variant `night` and `day`
    light_style = "day",    -- The theme is used when the background is set to light
    transparent = true,     -- Enable this to disable setting the background color
    terminal_colors = true, -- Configure the colors used when opening a `:terminal` in Neovim
    styles = {
        -- Style to be applied to different syntax groups
        -- Value is any valid attr-list value for `:help nvim_set_hl`
        comments = { italic = true },
        keywords = { italic = true },
        functions = {},
        variables = {},
        -- Background styles. Can be "dark", "transparent" or "normal"
        sidebars = "transparent",     -- style for sidebars, see below
        floats = "dark",              -- style for floating windows
    },
    sidebars = { "qf", "help" },      -- Set a darker background on sidebar-like windows. For example: `["qf", "vista_kind", "terminal", "packer"]`
    day_brightness = 0.3,             -- Adjusts the brightness of the colors of the **Day** style. Number between 0 and 1, from dull to vibrant colors
    hide_inactive_statusline = false, -- Enabling this option, will hide inactive statuslines and replace them with a thin border instead. Should work with the standard **StatusLine** and **LuaLine**.
    dim_inactive = true,             -- dims inactive windows
    lualine_bold = false,             -- When `true`, section headers in the lualine theme will be bold
})

vim.cmd('colorscheme tokyonight')
local colors = require("tokyonight.colors")
vim.api.nvim_set_hl(0, "WinSeparator", { fg = colors.default.terminal_black })
vim.api.nvim_set_hl(0, "CursorLineNr", { fg = colors.default.red, bold = true })
vim.api.nvim_set_hl(0, "LineNr", { fg = colors.default.red, bold = true })
vim.api.nvim_set_hl(0, "LineNrAbove", { fg = colors.default.dark5 })
vim.api.nvim_set_hl(0, "LineNrBelow", { fg = colors.default.dark5 })

-- vim.api.nvim_set_hl(0, "Normal", { bg = "none" })
-- vim.api.nvim_set_hl(0, "NormalFloat", { bg = "none" })
