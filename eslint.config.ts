import { defineConfig } from "eslint/config";

export const config = defineConfig([
  {
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
  },
]);
