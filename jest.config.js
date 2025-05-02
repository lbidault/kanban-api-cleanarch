/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  setupFiles: ["./jest.setup.ts"],
  resetModules: true, // ⬅️ force Jest à recharger les modules
};
