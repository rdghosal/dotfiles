require('nvim-treesitter.configs').setup {
    rainbow = {
        enable = true,
        disable = { 'jsx', 'tsx', 'html' },
        query = 'rainbow-parens',
        strategy = require('ts-rainbow').strategy.global,
    }
}
