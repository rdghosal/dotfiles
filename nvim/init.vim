lua require('plugins')
lua require('setup')

set tabstop=4
set softtabstop=4
set shiftwidth=4
set number
set relativenumber
set colorcolumn=80

augroup packer_user_config
  autocmd!
  autocmd BufWritePost plugins.lua source <afile> | PackerCompile
augroup end

