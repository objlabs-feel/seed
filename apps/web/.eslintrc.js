/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'prettier'
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  rules: {
    'indent': ['error', 2],  // 2칸 들여쓰기 강제
    'no-trailing-spaces': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
  }
};
