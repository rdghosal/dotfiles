-- Language servers.
local capabilities = require("cmp_nvim_lsp").default_capabilities()
local on_attach = function(_, bufnr)
  local bufopts = { noremap = true, silent = true, buffer = bufnr }
  -- vim.lsp.inlay_hint.enable(true, { bufnr = bufnr })
  vim.keymap.set("n", "gD", vim.lsp.buf.declaration, bufopts)
  vim.keymap.set("n", "gd", vim.lsp.buf.definition, bufopts)
  vim.keymap.set("n", "K", function()
    vim.lsp.buf.hover({
      border = "single",
    })
  end, bufopts)
  vim.keymap.set("n", "gi", vim.lsp.buf.implementation, bufopts)
  vim.keymap.set("n", "<Shift-k>", vim.lsp.buf.signature_help, bufopts)
  vim.keymap.set("n", "<space>wa", vim.lsp.buf.add_workspace_folder, bufopts)
  vim.keymap.set("n", "<space>wr", vim.lsp.buf.remove_workspace_folder, bufopts)
  vim.keymap.set("n", "<space>wl", function()
    print(vim.inspect(vim.lsp.buf.list_workspace_folders()))
  end, bufopts)
  vim.keymap.set("n", "<space>D", vim.lsp.buf.type_definition, bufopts)
  vim.keymap.set("n", "<space>rn", vim.lsp.buf.rename, bufopts)
  vim.keymap.set("n", "<space>ca", vim.lsp.buf.code_action, bufopts)
  vim.keymap.set("n", "gr", vim.lsp.buf.references, bufopts)
  vim.keymap.set("n", "<space>f", function()
    vim.lsp.buf.format({ async = true })
  end, bufopts)
end

require("lspconfig")["yamlls"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["intelephense"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["gopls"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["tsserver"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["html"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["pyright"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["cssmodules_ls"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["cssls"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["clangd"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})
require("lspconfig")["lua_ls"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
  settings = {
    Lua = {
      diagnostics = {
        globals = { "vim" },
      },
    },
  },
})
require("lspconfig")["rust_analyzer"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
  settings = {
    ["rust-analyzer"] = {
      imports = {
        granularity = {
          group = "module",
        },
        prefix = "self",
      },
      cargo = {
        buildScripts = {
          enable = true,
        },
      },
      procMacro = {
        enable = true
      },
      checkOnSave = {
        command = 'clippy'
      }
    }
  },
})
require("lspconfig")["gleam"].setup({
  capabilities = capabilities,
  on_attach = on_attach,
})

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
