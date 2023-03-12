lua require('plugins')
lua require('setup')
lua require('mappings')

augroup packer_user_config
  autocmd!
  autocmd BufWritePost plugins.lua source <afile> | PackerCompile
augroup end

