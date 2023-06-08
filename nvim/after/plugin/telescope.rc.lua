local telescope = require('telescope')

telescope.setup {
  previewer = false,
  defaults = { file_ignore_patterns = {"node_modules", ".git", "pycache"} },
  extensions = {},
}

telescope.load_extension 'harpoon'
