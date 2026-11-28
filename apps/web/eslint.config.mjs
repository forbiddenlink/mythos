import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // ES2023 array copy methods crash older Safari/Chrome (Sentry MYTHOS-14).
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name=/^(toSorted|toReversed|toSpliced)$/]",
          message:
            "Not supported in older browsers. Use [...arr].sort()/reverse()/splice() instead.",
        },
      ],
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated PWA service worker files
    "public/sw.js",
    "public/workbox-*.js",
    // Generated test artifacts and coverage reports
    "test-results/**",
    "playwright-report/**",
    "coverage/**",
    // Utility scripts using CommonJS
    "audit_codebase_images.js",
  ]),
]);

export default eslintConfig;
