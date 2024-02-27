require("ibl").setup {
    scope = {
        char = "",
        show_end = true,
        show_exact_scope = true,
        show_start = false,
    },
    whitespace = {
        remove_blankline_trail = false,
    }

}

vim.api.nvim_set_hl(0, "IndentBlanklineSpaceChar", { fg = "none" })
