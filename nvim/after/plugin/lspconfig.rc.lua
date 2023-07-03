-- Language servers.
local capabilities = require('cmp_nvim_lsp').default_capabilities()
local on_attach = function(client, bufnr)
    local bufopts = { noremap = true, silent = true, buffer = bufnr }
    vim.keymap.set('n', 'gD', vim.lsp.buf.declaration, bufopts)
    vim.keymap.set('n', 'gd', vim.lsp.buf.definition, bufopts)
    vim.keymap.set('n', 'K', function()
        vim.lsp.buf.hover({
            border = "single"
        })
    end, bufopts)
    vim.keymap.set('n', 'gi', vim.lsp.buf.implementation, bufopts)
    vim.keymap.set('n', '<Shift-k>', vim.lsp.buf.signature_help, bufopts)
    vim.keymap.set('n', '<space>wa', vim.lsp.buf.add_workspace_folder, bufopts)
    vim.keymap.set('n', '<space>wr', vim.lsp.buf.remove_workspace_folder, bufopts)
    vim.keymap.set('n', '<space>wl', function()
        print(vim.inspect(vim.lsp.buf.list_workspace_folders()))
    end, bufopts)
    vim.keymap.set('n', '<space>D', vim.lsp.buf.type_definition, bufopts)
    vim.keymap.set('n', '<space>rn', vim.lsp.buf.rename, bufopts)
    vim.keymap.set('n', '<space>ca', vim.lsp.buf.code_action, bufopts)
    vim.keymap.set('n', 'gr', vim.lsp.buf.references, bufopts)
    vim.keymap.set('n', '<space>f', function() vim.lsp.buf.format { async = true } end, bufopts)
end

require('lspconfig')['tsserver'].setup {
    capabilities = capabilities, on_attach = on_attach
}
require('lspconfig')['pyright'].setup {
    capabilities = capabilities, on_attach = on_attach
}
require('lspconfig')['cssmodules_ls'].setup {
    capabilities = capabilities, on_attach = on_attach
}
require('lspconfig')['cssls'].setup {
    capabilities = capabilities, on_attach = on_attach
}
require('lspconfig')['clangd'].setup {
    capabilities = capabilities, on_attach = on_attach
}
require('lspconfig')['lua_ls'].setup {
    capabilities = capabilities, on_attach = on_attach,
    settings = {
        Lua = {
            diagnostics = {
                globals = { 'vim' }
            }
        }
    }
}

-- local opts = {
--     tools = {
--         runnables = {
--             use_telescope = true,
--         },
--         inlay_hints = {
--             auto = true,
--             show_parameter_hints = false,
--             parameter_hints_prefix = "",
--             other_hints_prefix = "",
--         },
--         server = {
--             standalone = true,
--         }
--     }
-- }
-- -- require('rust-tools').setup(opts)
-- require('lspconfig')['rust_analyzer'].setup {
--     capabilities = capabilities,
--     on_attach = on_attach,
--     settings = {
--         ['rust-analyzer'] = {
--             diagnostics = {
--                 enable = true,
--             }
--         }
--     }
-- }
