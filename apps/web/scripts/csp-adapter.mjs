import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { generateCspManifest } from "./csp-hashes.mjs";

const wrapperPath = fileURLToPath(import.meta.url);

async function nativeAdapter(projectDir) {
  const nativePath = process.env.NEXT_ADAPTER_PATH;
  if (!nativePath)
    throw new Error("csp-adapter: native adapter path is missing");
  const require = createRequire(path.join(projectDir, "package.json"));
  const resolved = require.resolve(nativePath);
  if (resolved === wrapperPath)
    throw new Error("csp-adapter: refusing recursive native adapter");
  const imported = await import(pathToFileURL(resolved).href);
  return imported.default ?? imported;
}

const cspAdapter = {
  name: "Mythos CSP + native platform",
  async modifyConfig(config, context) {
    const adapter = await nativeAdapter(context.projectDir);
    const modified = adapter.modifyConfig
      ? await adapter.modifyConfig(config, context)
      : config;
    return { ...modified, adapterPath: wrapperPath };
  },
  async onBuildComplete(context) {
    const adapter = await nativeAdapter(context.projectDir);
    if (typeof adapter.onBuildComplete !== "function") {
      throw new Error("csp-adapter: native adapter has no build-complete hook");
    }
    generateCspManifest(context);
    // Output enumeration precedes this hook. Add the newly generated public
    // manifest explicitly so a clean checkout packages it with the same build.
    const pathname = `${context.config.basePath ?? ""}/csp-manifest.json`;
    const entry = {
      type: "STATIC_FILE",
      id: "mythos-csp-manifest",
      pathname,
      filePath: path.join(context.projectDir, "public", "csp-manifest.json"),
      immutableHash: undefined,
    };
    const index = context.outputs.staticFiles.findIndex(
      (output) => output.pathname === pathname,
    );
    if (index < 0) context.outputs.staticFiles.push(entry);
    else context.outputs.staticFiles[index] = entry;
    await adapter.onBuildComplete(context);
  },
};

export default cspAdapter;
