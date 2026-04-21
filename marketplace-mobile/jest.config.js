module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^expo-modules-core$": "<rootDir>/node_modules/expo/node_modules/expo-modules-core",
    "^expo-modules-core/(.*)$":
      "<rootDir>/node_modules/expo/node_modules/expo-modules-core/$1",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testPathIgnorePatterns: ["/node_modules/", "/app/"]
};
