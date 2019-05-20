module.exports = {
  plugins: ['mocha', 'promise', 'security', 'chai-expect', 'chai-friendly'],
  extends: [
    'airbnb-base',
    'plugin:promise/recommended',
    'plugin:security/recommended',
    'prettier',
  ],
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  rules: {
    // error
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-identical-title': 'error',
    'mocha/no-nested-tests': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/no-cycle': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],

    // warning
    'no-warning-comments': 'warn',
    'mocha/no-pending-tests': 'warn',
    'mocha/no-skipped-tests': 'warn',

    // TODO: Activate body-style for arrow-funcs
    // "arrow-body-style": ["warn", "always"]

    // annoying
    'no-shadow': 'off',
    'prefer-destructuring': 'off',
    'no-param-reassign': 'off',

    // chai stuff
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
    'chai-expect/missing-assertion': 2,
    'chai-expect/terminating-properties': 1,

    // security stuff
    'security/detect-object-injection': 'off',
  },
};
