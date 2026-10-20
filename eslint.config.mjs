import expoConfig from 'eslint-config-expo/flat.js';

export default [
  ...expoConfig,
  {
    ignores: [
      'node_modules/**',
      '**/*.json',
      '.expo/**',
      'dist/**',
      'dist-android/**',
      'test-results/**',
      'playwright-report/**',
      '.release/**',
      '.publish/**',
      'data/staging/map-sources/**',
      'data/staging/geonames/**',
      // Content-only gzip strings; places:check verifies every byte, hash and decoded schema.
      // Keep the generated loader and all application code under ESLint.
      'src/places/generated/world/dom-' + '[a-f0-9]'.repeat(64) + '.ts',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];
