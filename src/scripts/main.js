import { onDomReady } from "./utils/dom-ready.js";

onDomReady(() => {
  document.documentElement.classList.add("js-ready");
});
