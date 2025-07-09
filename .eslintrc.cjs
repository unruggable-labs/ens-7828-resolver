module.exports = {
  extends: ["@gazzati/eslint-config-node"],
  ignorePatterns: ["dist/", "node_modules/"],
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
  },
};
