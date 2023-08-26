vim.cmd [[packadd packer.nvim]]

vim.g.mapleader = ' '
-- vim.g.gruvbox_termcolors = 16
-- vim.o.background = 'dark'
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
vim.opt.wrap = true
vim.opt.colorcolumn = "80"

vim.opt.list = true
vim.opt.listchars:append "space:·"
vim.opt.listchars:append "eol:↵"
vim.opt.listchars:append "tab:>-"
vim.opt.guicursor = "n-c:block,v:hor50,i-ci-ve:ver25,r-cr:hor20,o:hor50,a:blinkwait700-blinkoff400-blinkon250-Cursor/lCursor,sm:block-blinkwait175-blinkoff150-blinkon175"

vim.opt.undodir = os.getenv("HOME") .. "/.nvim/undo"
vim.opt.undofile = true
