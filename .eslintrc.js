module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "env": {
      "browser": true,
    },
    "rules": {
      "no-underscore-dangle": 0,
      "no-plusplus": 0,
      "no-param-reassign": 0,
      "react/prop-types": 0,
      "react/sort-comp": 0,
      "no-console": 0, //remove this later
      "react/jsx-no-bind": 0,
      "react/jsx-filename-extension": [1, { "extensions": [".js"] }],
    }
};