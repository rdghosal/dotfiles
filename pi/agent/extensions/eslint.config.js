// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ["node_modules/**", "dist/**", "build/**"],
  },
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // Allow unused variables that start with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow explicit any when needed
      "@typescript-eslint/no-explicit-any": "off",
      // Require return types on functions (optional, can be strict)
      "@typescript-eslint/explicit-function-return-type": "off",
      // Require explicit member accessibility (public/private)
      "@typescript-eslint/explicit-member-accessibility": "off",
      // Consistent type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // Allow unnecessary escapes in regex (common in template strings)
      "no-useless-escape": "off",
      // Allow control characters in regex (used for ANSI codes)
      "no-control-regex": "off",
      // Allow empty blocks
      "no-empty": "off",
      // Prefer const
      "prefer-const": "warn",
    },
  }
);
