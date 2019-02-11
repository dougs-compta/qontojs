module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ["**/__tests__/**/*.spec.ts"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/index.ts",
        "!src/**/utilities.ts"
    ],
    coverageDirectory: './coverage'
};