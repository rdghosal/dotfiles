local telescope = require('telescope')
local builtin = require('telescope.builtin')
local harpoon_mark = require('harpoon.mark')
local harpoon_ui = require('harpoon.ui')

--------------------------------- Windows ----------------------------------- #

-- Split window
vim.keymap.set('n', '<leader>v', ':vsplit<CR><C-w>l')
vim.keymap.set('n', '<leader>s', ':split<CR><C-w>k')

-- Jump to window
vim.keymap.set('n', '<leader>w', '<C-w>w')
vim.keymap.set('n', '<leader>h', '<C-w>h')
vim.keymap.set('n', '<leader>j', '<C-w>j')
vim.keymap.set('n', '<leader>k', '<C-w>k')
vim.keymap.set('n', '<leader>l', '<C-w>l')

-- Resize window
vim.keymap.set('n', '<leader><left>', '<C-w><')
vim.keymap.set('n', '<leader><right>', '<C-w>>')
vim.keymap.set('n', '<leader><up>', '<C-w>+')
vim.keymap.set('n', '<leader><down>', '<C-w>-')


-------------------------------- Telescope ---------------------------------- #

vim.keymap.set('n', ';g', builtin.live_grep)
vim.keymap.set('n', ';b', builtin.buffers)
vim.keymap.set('n', ';h', builtin.help_tags)
vim.keymap.set('n', ';;', builtin.resume)
vim.keymap.set('n', ';d', builtin.diagnostics)
vim.keymap.set('n', ';ff',
	function()
		builtin.find_files({
			no_ignore = false,
			hidden = false,
            previewer = false
		})
	end)

-- File browser
local function telescope_buffer_dir()
	return vim.fn.expand('%:p:h')
end

vim.keymap.set("n", ";fb", function()
	telescope.extensions.file_browser.file_browser({
		path = "%:p:h",
		cwd = telescope_buffer_dir(),
		respect_gitignore = false,
		hidden = true,
		grouped = true,
		previewer = true,
		initial_mode = "normal",
		layout_config = { height = 20 }
	})
end)

-------------------------------- Harpoon ------------------------------------ #

vim.keymap.set('n', '\\m', function ()
    print('--harpooned-->')
    harpoon_mark.add_file()
    end)
vim.keymap.set('n', '\\n', harpoon_ui.nav_next)
vim.keymap.set('n', '\\p', harpoon_ui.nav_prev)
vim.keymap.set('n', '\\l', harpoon_ui.toggle_quick_menu)

