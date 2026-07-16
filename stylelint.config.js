/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard-scss", "stylelint-config-prettier-scss"],
  rules: {
    "no-descending-specificity": null,
    "selector-class-pattern": [
      "^[a-z0-9]+(-[a-z0-9]+)*(--[a-z0-9]+(-[a-z0-9]+)*)?$",
      { message: "Expected class selector to match the layer's naming convention (e.g. c-button--outline)" },
    ],
  },
};
