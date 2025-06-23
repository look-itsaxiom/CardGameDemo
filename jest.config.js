module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    moduleFileExtensions: ["ts", "tsx", "js", "json"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/?(*.)+(spec|test).(ts|tsx|js)"],
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.json",
        },
    },
};
