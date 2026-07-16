declare module "gulp-plumber" {
  import type { Transform } from "node:stream";

  interface PlumberOptions {
    errorHandler?: false | ((this: Transform, error: Error) => void);
  }

  function plumber(options?: PlumberOptions): Transform;
  export default plumber;
}

declare module "gulp-postcss" {
  import type { Transform } from "node:stream";

  import type { AcceptedPlugin } from "postcss";

  function gulpPostcss(plugins?: AcceptedPlugin[]): Transform;
  export default gulpPostcss;
}
