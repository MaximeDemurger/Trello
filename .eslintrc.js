module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    project: ['tsconfig.json'],
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },

  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:jest/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-require-imports': 0,
    '@typescript-eslint/array-type': 2,
    '@typescript-eslint/no-empty-object-type': 0,
    '@typescript-eslint/naming-convention': [
      2,
      {
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        selector: ['function', 'variable'],
        leadingUnderscore: 'allow',
      },
    ],
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 2,
    '@typescript-eslint/prefer-optional-chain': 2,
    'react-native/sort-styles': 2,
    'react-native/no-color-literals': 2,
    'react-native/no-unused-styles': 2,
    'react-native/no-single-element-style-arrays': 2,
    'react/jsx-sort-props': [
      2,
      {
        ignoreCase: true,
        reservedFirst: ['ref', 'key'],
      },
    ],
    'jest/no-commented-out-tests': 'off',
    'jest/no-mocks-import': 'off',
    'jest/expect-expect': 'off',
    'jest/no-disabled-tests': 'off',
  },
  overrides: [
    {
      files: ['*.stories.tsx', '*.placeholder.tsx'],
      rules: {
        'react-native/no-inline-styles': 0,
        'react-native/no-color-literals': 0,
      },
    },
    {
      files: ['*.spec.tsx'],
      rules: {
        'react-native/no-color-literals': 0,
      },
    },
  ],
}
