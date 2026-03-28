import parser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["node_modules/", "dist/", "build/", ".vite/", "public/"],
  },
  {
    files: [
      "src/**/*.{ts,tsx,js,jsx}",
      "tests/**/*.{ts,tsx,js,jsx}",
      "playwright.config.ts",
      "vite.config.ts",
    ],
    languageOptions: {
      parser,
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
] as any[];
