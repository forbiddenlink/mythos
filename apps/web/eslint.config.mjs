import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
    // Coverage reports
    "coverage/**",
    // Utility scripts using CommonJS
    "audit_codebase_images.js",
  ]),
]);

export default eslintConfig;
