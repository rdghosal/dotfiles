local telescope = require('telescope')
local utils = require('telescope.utils')

telescope.setup {
  previewer = true,
  mirror = true,
  defaults = {
        cwd = utils.buffer_dir(),
        sorting_strategy = "ascending",
        file_ignore_patterns = {
            "node_modules",
            ".git",
            "pycache"
        },
        layout_config = { prompt_position = "top" }
    },
  extensions = {},
}
-- telescope.load_extension 'harpoon'
