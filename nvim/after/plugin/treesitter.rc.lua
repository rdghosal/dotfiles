local ts = require('nvim-treesitter.configs')

ts.setup {
  indent = {
    enable = true,
    disable = {},
  },
  autotag = {
    enable = true,
  },
}

