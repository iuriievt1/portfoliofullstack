export default {
  rootDir: ".",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.json" }]
  },
  testRegex: ".*\\.spec\\.ts$"
};
