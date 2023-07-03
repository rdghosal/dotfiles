-- Register plugins.
return require('packer').startup(function(use)
    -------------------------------- Installer ---------------------------------- #

    use "wbthomason/packer.nvim"

    ----------------------------------- UI -------------------------------------- #

    use { "folke/tokyonight.nvim" }
    use {
        'nvim-lualine/lualine.nvim',
        requires = { 'kyazdani42/nvim-web-devicons', opt = true }
    }
    use { 'nvim-tree/nvim-web-devicons' }
    use { 'HiPhish/nvim-ts-rainbow2' }
    use {
        'nvim-treesitter/nvim-treesitter',
        run = ':TSUpdate'
    }

    ------------------------------- Navigation ---------------------------------- #
    use { 'airblade/vim-rooter' }
    use { 'ThePrimeagen/harpoon' }
    use {
        'nvim-telescope/telescope.nvim', tag = '0.1.x',
        requires = { { 'nvim-lua/plenary.nvim' } }
    }
    use { 'christoomey/vim-tmux-navigator' }

    -------------------------------- Utiliies ----------------------------------- #

    use 'mattn/emmet-vim'
    use 'tpope/vim-surround'
    use 'tpope/vim-commentary'
    use 'windwp/nvim-ts-autotag'
    use {
        "windwp/nvim-autopairs",
        config = function() require("nvim-autopairs").setup {} end
    }
    use({
        "iamcco/markdown-preview.nvim",
        run = "cd app && npm install",
        setup = function() vim.g.mkdp_filetypes = { "markdown" } end,
        ft = { "markdown" }
    })

    ---------------------------- Language Servers ------------------------------- #

    use 'neovim/nvim-lspconfig'
    use "williamboman/mason.nvim"
    use "williamboman/mason-lspconfig.nvim"
    use 'simrat39/rust-tools.nvim'
    use 'mfussenegger/nvim-jdtls'
    use 'jose-elias-alvarez/null-ls.nvim'
    use 'MunifTanjim/prettier.nvim'

    ----------------------------- Code completion ------------------------------- #

    use 'hrsh7th/cmp-nvim-lsp'
    use 'hrsh7th/cmp-buffer'
    use 'hrsh7th/cmp-path'
    use 'hrsh7th/cmp-cmdline'
    use 'hrsh7th/nvim-cmp'
    use({
        "L3MON4D3/LuaSnip",
        -- follow latest release.
        -- tag = "v<CurrentMajor>.*",
        -- install jsregexp (optional!:).
        run = "make install_jsregexp",
        -- config = function() require('config.snippets') end,
    })

    ---------------------------------- Git -------------------------------------- #

    use 'tpope/vim-fugitive'
    use 'lewis6991/gitsigns.nvim'
end)
