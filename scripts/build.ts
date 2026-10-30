import { rm } from "node:fs/promises";
import { dependencies } from "../package.json";

// Externalize npm dependencies explicitly: --packages external also leaves @/ aliases unresolved.
await rm("dist", { recursive: true, force: true });
const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "node",
  external: [...Object.keys(dependencies), "fastify-plugin"],
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log("Node backend built: dist/index.js");
