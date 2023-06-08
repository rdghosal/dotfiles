local builtin = require('telescope.builtin')
local harpoon_mark = require('harpoon.mark')
local harpoon_ui = require('harpoon.ui')

--------------------------------- Windows ----------------------------------- #

-- Split window
vim.keymap.set('n', '|', ':vsplit<CR><C-w>l')
vim.keymap.set('n', '<Bslash>', ':split<CR><C-w>j')

-- Jump to window
vim.keymap.set('n', '<C-w>', '<C-w>w')
vim.keymap.set('n', '<C-h>', '<C-w>h')
vim.keymap.set('n', '<C-j>', '<C-w>j')
vim.keymap.set('n', '<C-k>', '<C-w>k')
vim.keymap.set('n', '<C-l>', '<C-w>l')

-- Vertical navigation
vim.keymap.set('n', '}', '}zz')
vim.keymap.set('n', '<C-o>', '<C-o>zz')
vim.keymap.set('n', '<C-i>', '<C-i>zz')
vim.keymap.set('n', '<C-u>', '<C-u>zz')
vim.keymap.set('n', '<C-d>', '<C-d>zz')

-- Resize window
vim.keymap.set('n', '<leader><left>', '<C-w><')
vim.keymap.set('n', '<leader><right>', '<C-w>>')
vim.keymap.set('n', '<leader><up>', '<C-w>+')
vim.keymap.set('n', '<leader><down>', '<C-w>-')


-------------------------------- Telescope ---------------------------------- #

vim.keymap.set('n', '<leader>fw',
    function()
        builtin.live_grep({
            debounce = 100,
        })
    end)
vim.keymap.set('n', '<leader>b', builtin.buffers)
vim.keymap.set('n', '<leader>h', builtin.help_tags)
-- vim.keymap.set('n', '<leader>;', builtin.resume)
vim.keymap.set('n', '<leader>d', builtin.diagnostics)
vim.keymap.set('n', '<leader>ff',
    function()
        builtin.find_files({
            no_ignore = false,
            hidden = true,
            previewer = false
        })
    end)

-------------------------------- Harpoon ------------------------------------ #

vim.keymap.set('n', '\\m', function()
    print('--harpooned-->')
    harpoon_mark.add_file()
end)
vim.keymap.set('n', '\\n', harpoon_ui.nav_next)
vim.keymap.set('n', '\\p', harpoon_ui.nav_prev)
vim.keymap.set('n', '\\l', harpoon_ui.toggle_quick_menu)

--------------------------------- Emmet ------------------------------------- #

vim.g.user_emmet_leader_key = '<C-e>'
