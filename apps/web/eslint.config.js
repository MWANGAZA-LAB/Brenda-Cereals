import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
});
const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            // TypeScript-only rules
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            // Disallow JavaScript files
            "no-restricted-globals": ["error", {
                    "name": "require",
                    "message": "Use ES6 imports instead of require()"
                }]
        }
    }
];
export default eslintConfig;
