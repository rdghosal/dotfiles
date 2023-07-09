require("indent_blankline").setup {
    char = "",
    space_char_blankline = " ",
    show_current_context = true,
    show_current_context_start = false,
    show_trailing_blankline_indent = false,
}

-- Disable highlighting of, e.g., tabs during `list` mode.
vim.api.nvim_set_hl(0, "IndentBlanklineSpaceChar", { fg = "none" })
