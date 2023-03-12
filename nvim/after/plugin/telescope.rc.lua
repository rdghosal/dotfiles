local telescope = require('telescope')
local fb_actions = telescope.extensions.file_browser.actions

telescope.setup {
  extensions = {
    file_browser = {
      theme = "ivy",
      -- disables netrw and use telescope-file-browser in its place
      hijack_netrw = true,
      mappings = {
        ["i"] = {
          -- your custom insert mode mappings
        },
        ["n"] = {
          -- your custom normal mode mappings
          ["n"] = fb_actions.create,
          ["d"] = fb_actions.remove,
          ["m"] = fb_actions.rename,
          ["p"] = fb_actions.goto_parent_dir,
          ["/"] = function()
            vim.cmd('startinsert')
          end
        },
      },
	  hidden = true,
	  no_ignore = false,
	  previewer = true,
    },
  },
}

telescope.load_extension 'file_browser'
telescope.load_extension 'harpoon'

