return {
  ----------------------------------- UI -------------------------------------- #

  { "EdenEast/nightfox.nvim", lazy = false, priority = 1000 },
  { "lukas-reineke/indent-blankline.nvim" },
  { "nvim-lualine/lualine.nvim", lazy = false, dependencies = { "nvim-tree/nvim-web-devicons", opt = true } },
  { "HiPhish/rainbow-delimiters.nvim" },
  { "nvim-treesitter/nvim-treesitter", build = ":TSUpdate" },
  { "nvim-treesitter/nvim-treesitter-context" },

  ------------------------------- Navigation ---------------------------------- #

  { "airblade/vim-rooter" },
  {
    "nvim-telescope/telescope.nvim",
    tag = "0.1.2",
    branch = "0.1.x",
    dependencies = { "nvim-lua/plenary.nvim" },
  },
  { "christoomey/vim-tmux-navigator" },
  {
    "nvim-neo-tree/neo-tree.nvim",
    lazy = false,
    priority = 900,
    branch = "v3.x",
    dependencies = {
      "nvim-lua/plenary.nvim",
      -- "nvim-tree/nvim-web-devicons",       -- not strictly required, but recommended
      "MunifTanjim/nui.nvim",
    },
  },

  ------------------------------- Utilities ----------------------------------- #

  { "mattn/emmet-vim" },
  { "tpope/vim-surround" },
  { "tpope/vim-commentary" },
  { "windwp/nvim-ts-autotag" },
  {
    "windwp/nvim-autopairs",
    config = function()
      require("nvim-autopairs").setup()
    end,
  },
  {
    "iamcco/markdown-preview.nvim",
    build = "cd app && npm install",
    setup = function()
      vim.g.mkdp_filetypes = { "markdown" }
    end,
    ft = { "markdown" },
  },

  ---------------------------- Language Servers ------------------------------- #

  { "neovim/nvim-lspconfig" },
  { "williamboman/mason.nvim" },
  { "williamboman/mason-lspconfig.nvim" },
  { "simrat39/rust-tools.nvim" },
  { "mfussenegger/nvim-jdtls" },
  { "jose-elias-alvarez/null-ls.nvim" },
  { "mhartington/formatter.nvim" },
  { "mfussenegger/nvim-lint" },
  { "MunifTanjim/prettier.nvim" },

  ----------------------------- Code completion ------------------------------- #

  {
    "hrsh7th/nvim-cmp",
    dependencies = { "hrsh7th/cmp-nvim-lsp", "hrsh7th/cmp-buffer" },
  },
  { "hrsh7th/cmp-path" },
  { "hrsh7th/cmp-cmdline" },
  {
    "L3MON4D3/LuaSnip",
    -- follow latest release.
    version = "v2.*",     -- Replace <CurrentMajor> by the latest released major (first number of latest release)
    -- install jsregexp (optional!).
    build = "make install_jsregexp"
  },

  ---------------------------------- Git -------------------------------------- #

  { "tpope/vim-fugitive" },
  { "lewis6991/gitsigns.nvim" },
}
