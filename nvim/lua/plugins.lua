-- Register plugins.
return require('packer').startup(function(use)

-------------------------------- Installer ---------------------------------- #

		use "wbthomason/packer.nvim"

----------------------------------- UI -------------------------------------- #

		use 'sainnhe/gruvbox-material'
		use {
		  'nvim-lualine/lualine.nvim',
		  requires = { 'kyazdani42/nvim-web-devicons', opt = true }
		}
		use 'nvim-tree/nvim-web-devicons'

------------------------------- Navigation ---------------------------------- #

		use {'romgrk/barbar.nvim', requires = 'nvim-web-devicons'}
		use {
		  'nvim-tree/nvim-tree.lua',
		  requires = {
			'nvim-tree/nvim-web-devicons', -- optional, for file icons
		  },
		  tag = 'nightly' -- optional, updated every week. (see issue #1193)
		}
		 use {
			'nvim-treesitter/nvim-treesitter',
			run = ':TSUpdate'
		}
		use {
		  'nvim-telescope/telescope.nvim', tag = '0.1.x',
		  requires = { {'nvim-lua/plenary.nvim'} }
		}
		use {
		"nvim-telescope/telescope-file-browser.nvim",
			requires = { 
				"nvim-telescope/telescope.nvim",
				"nvim-lua/plenary.nvim" 
			}
		}

-------------------------------- Utiliies ----------------------------------- #

		use 'tpope/vim-surround'
		use 'tpope/vim-commentary'
		use 'windwp/nvim-ts-autotag'
		use({ 
			"iamcco/markdown-preview.nvim",
			run = "cd app && npm install",
			setup = function() vim.g.mkdp_filetypes = { "markdown" } end,
			ft = { "markdown" }})
		use {
			"windwp/nvim-autopairs",
			config = function() require("nvim-autopairs").setup {} end
		}

---------------------------- Language Servers ------------------------------- #

		use "williamboman/mason.nvim"
		use 'neovim/nvim-lspconfig'
		use 'mfussenegger/nvim-jdtls'
		use 'jose-elias-alvarez/null-ls.nvim'
		use 'MunifTanjim/prettier.nvim'
		use({
			"glepnir/lspsaga.nvim",
			branch = "main",
			config = function()
				require("lspsaga").setup({})
			end,
			requires = {
				{"nvim-tree/nvim-web-devicons"},
				--Please make sure you install markdown and markdown_inline parser
				{"nvim-treesitter/nvim-treesitter"}
			}
		})

----------------------------- Code completion ------------------------------- #

		use 'hrsh7th/cmp-nvim-lsp'
		use 'hrsh7th/cmp-buffer'
		use 'hrsh7th/cmp-path'
		use 'hrsh7th/cmp-cmdline'
		use 'hrsh7th/nvim-cmp'

---------------------------------- Git -------------------------------------- #

		use 'tpope/vim-fugitive'
		use 'lewis6991/gitsigns.nvim'

	end)

