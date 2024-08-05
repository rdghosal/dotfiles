vim.cmd [[
    augroup highlight_yank
        autocmd!
        au TextYankPost * silent! lua vim.highlight.on_yank({higroup="IncSearch"})
    augroup END
]]

vim.g.mapleader = ' '

vim.api.nvim_exec('language ja_JP', true)
vim.o.background = 'dark'
vim.opt.termguicolors = true
vim.opt.laststatus = 3
vim.scriptencoding = 'utf-8'
vim.opt.encoding = 'utf-8'
vim.opt.fileencoding = 'utf-8'

vim.wo.number = true
vim.wo.relativenumber = true
vim.opt.title = true
vim.opt.autoindent = true
vim.opt.smartindent = true
vim.opt.shiftwidth = 2
vim.opt.softtabstop = 2
vim.opt.tabstop = 2
vim.opt.hlsearch = false
vim.opt.expandtab = true
vim.opt.ignorecase = true -- Case insensitive searching UNLESS /C or capital in search
vim.opt.smarttab = true
vim.opt.breakindent = true
vim.opt.wrap = true
vim.opt.colorcolumn = "80"

vim.opt.list = true
-- vim.opt.listchars:append "space:·"
vim.opt.listchars:append "eol:↵"
vim.opt.listchars:append "tab:>-"
vim.opt.cursorline = false
vim.opt.guicursor = "n-c:block,v:hor50,i-ci-ve:ver25,r-cr:hor20,o:hor50,a:blinkwait700-blinkoff400-blinkon250-Cursor/lCursor,sm:block-blinkwait175-blinkoff150-blinkon175"
vim.opt.scrolloff = 3

vim.opt.undodir = os.getenv("HOME") .. "/.nvim/undo"
vim.opt.undofile = true
vim.wo.signcolumn = "yes"

vim.api.nvim_set_hl(0, "VertSplit", { fg = "white" })
vim.api.nvim_set_hl(0, "HorizSplit", { fg = "white" })
