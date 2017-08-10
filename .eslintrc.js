module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    browser: true,
    es6: true,
    jquery: true,
    embertest: true,
  },
  rules: {
    'no-console': 0,
  }
};
