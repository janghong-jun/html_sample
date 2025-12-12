export default [
  {
    files: ["*.js", "dev/**/*.js"], // JS 파일 경로
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"],
      "no-unused-vars": ["warn"],
      "no-console": ["off"],
    },
    env: {
      browser: true,
      es2021: true,
    },
  },
];
