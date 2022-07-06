module.exports = {
  displayName: 'pori-actions',
  preset: '../../jest.preset.ts',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'json'],
  coverageDirectory: '../../coverage/packages/pori-actions',
  setupFiles: ['<rootDir>/.jest/setEnvVars.ts'],
};
