vim.cmd [[packadd packer.nvim]]
vim.cmd [[colorscheme gruvbox]]

vim.g.mapleader = ' '
vim.o.background = 'dark'
vim.opt.termguicolors = true

vim.scriptencoding = 'utf-8'
vim.opt.encoding = 'utf-8'
vim.opt.fileencoding = 'utf-8'

vim.wo.number = true
vim.wo.relativenumber = true
vim.opt.title = true
vim.opt.autoindent = true
vim.opt.smartindent = true
vim.opt.shiftwidth = 4
vim.opt.softtabstop = 4
vim.opt.tabstop = 4
vim.opt.hlsearch = false
vim.opt.expandtab = true
vim.opt.ignorecase = true -- Case insensitive searching UNLESS /C or capital in search
vim.opt.smarttab = true
vim.opt.breakindent = true
vim.opt.wrap = false
vim.opt.colorcolumn = "80"
vim.api.nvim_set_hl(0, "Normal", { bg = "none" })
vim.api.nvim_set_hl(0, "NormalFloat", { bg = "none" })

----------------------------- Misc. Plugin Setup ---------------------------- #

require('lualine').setup { options = { theme = 'gruvbox-material' } }
require('gitsigns').setup()
require('mason').setup()
require("mason-lspconfig").setup(
    { ensure_installed = { 'lua_ls', 'tsserver', 'pyright', 'clangd'} })
require('nvim-ts-autotag').setup()
