require('nvim-treesitter.configs').setup {
    rainbow = {
        enable = true,
        disable = { 'jsx', 'tsx' },
        query = 'rainbow-parens',
        strategy = require('ts-rainbow').strategy.global,
    }
}
