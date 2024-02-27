require('lint').linters_by_ft = {
  python = {'flake8',},
  golang = {'golangci-lint',}
}

vim.api.nvim_create_autocmd({ "BufWritePost" }, {
  callback = function()
    require("lint").try_lint()
  end,
})
