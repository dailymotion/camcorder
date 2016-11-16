module.exports = {
  root : true,
  env  : {
    browser : true,
    node    : true,
    es6     : true,
  },
  ecmaFeatures: {
    modules: true
  },
  parser : "babel-eslint",
  extends: "eslint:recommended",
}