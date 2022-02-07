/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: ['src/rise/**/*.ts'],
    testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/dist/'],

    globals: {
        'ts-jest': {
            isolatedModules: true
        }
    }
}
