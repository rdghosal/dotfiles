require("indent_blankline").setup {
    char = "",
    show_current_context = true,
    show_current_context_start = false,
}

-- Disable highlighting of, e.g., tabs during `list` mode.
vim.api.nvim_set_hl(0, "IndentBlanklineSpaceChar", { fg = "none" })
