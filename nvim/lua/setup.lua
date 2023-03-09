vim.cmd [[packadd packer.nvim]]
vim.cmd [[colorscheme gruvbox-material]]

-- require('bufferline').setup()
require('lualine').setup{ options = { theme = 'gruvbox-material' } }
require('mason').setup()
require('nvim-tree').setup()
require('nvim-ts-autotag').setup()

