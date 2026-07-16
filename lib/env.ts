import type { BuildMode } from "../config/index.js";

export function getMode(): BuildMode {
  const args = process.argv.slice(2);
  if (args.includes("--production")) return "production";
  if (process.env.NODE_ENV === "production") return "production";
  return "development";
}
