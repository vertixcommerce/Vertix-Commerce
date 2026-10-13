import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({esbuild:{jsx:"automatic"},test:{environment:"node"},resolve:{alias:{"@":path.resolve(__dirname,"."),"@payload-config":path.resolve(__dirname,"payload.config.ts")}}});
