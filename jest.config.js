// jest.config.js
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["<rootDir>/tests/**/*.test.ts"],
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest",
      "^.+\\.(js|jsx)$": "babel-jest",
    },
    transformIgnorePatterns: [
        "/node_modules/(?!axios).+\\.js$"
      ],  
  };
  