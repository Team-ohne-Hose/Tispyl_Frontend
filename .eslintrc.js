module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],

  plugins: ['html'],

  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },

  rules: {
    '@typescript-eslint/camelcase': 'off',
    'no-console': 'off',
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'no-eval': ['error'],
    'no-trailing-spaces': ['error', { skipBlankLines: true }],
    'no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
    'no-use-before-define': ['error', { functions: true, classes: true }],
    'max-len': ['error', { code: 140 }],
    'no-var': ['error'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-empty-function': ['error', { allow: ['constructors'] }],
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
};
