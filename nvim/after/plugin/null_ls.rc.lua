----------------------------------------------------------------------- null-ls

local null_ls = require("null-ls")
local augroup = vim.api.nvim_create_augroup("LspFormatting", {})
null_ls.setup({
    -- you can reuse a shared lspconfig on_attach callback here
    on_attach = function(client, bufnr)
        vim.lsp.buf.format({ timeout_ms = 2000 })
        if client.supports_method("textDocument/formatting") then
            vim.api.nvim_clear_autocmds({ group = augroup, buffer = bufnr })
            vim.api.nvim_create_autocmd("BufWritePre", {
                group = augroup,
                buffer = bufnr,
                callback = function()
                    -- on 0.8, you should use vim.lsp.buf.format({ bufnr = bufnr }) instead
                    -- on later neovim version, you should use vim.lsp.buf.format({ async = false }) instead
                    vim.lsp.buf.format({ async = false })
                    -- vim.lsp.buf.formatting_sync()
                end,
            })
        end
    end,
    sources = {
        null_ls.builtins.formatting.prettier,
        null_ls.builtins.formatting.rustfmt,
    },
})

---------------------------------------------------------------------- prettier

-- local prettier = require("prettier")
-- prettier.setup({
--     bin = 'prettier', -- or `'prettierd'` (v0.23.3+)
--     filetypes = {
--         "css",
--         "graphql",
--         "html",
--         "javascript",
--         "javascriptreact",
--         "json",
--         "less",
--         "markdown",
--         "scss",
--         "typescript",
--         "typescriptreact",
--         "yaml"
--     },
-- })