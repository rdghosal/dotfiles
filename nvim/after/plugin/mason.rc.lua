require("mason").setup()
require("mason-lspconfig").setup({
    ensure_installed = {
        "lua_ls", "tsserver", "pyright", "clangd", "rust_analyzer", "cssls", "html", "cssmodules_ls", "flake8"
    }
})
