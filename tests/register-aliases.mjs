import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

function resolveAliasPath(specifier) {
  if (!specifier.startsWith('@/')) {
    return null;
  }

  const basePath = path.join(projectRoot, specifier.slice(2));
  const candidates = [basePath, ...extensions.map((ext) => `${basePath}${ext}`)];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }

  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolvedUrl = resolveAliasPath(specifier);
    if (resolvedUrl) {
      return {
        shortCircuit: true,
        url: resolvedUrl,
      };
    }

    return nextResolve(specifier, context);
  },
});
