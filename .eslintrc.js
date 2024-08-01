module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  rules: {
    'prettier/prettier': 0,
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/no-unsafe-function-type': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
