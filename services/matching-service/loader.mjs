// Custom ES module loader to handle .js imports for .ts files
import { pathToFileURL } from 'url';
import { resolve as resolvePath } from 'path';
import { existsSync } from 'fs';

export async function resolve(specifier, context, defaultResolve) {
  // Handle .js extensions that should resolve to .ts files
  if (specifier.endsWith('.js')) {
    const tsSpecifier = specifier.replace(/\.js$/, '.ts');
    
    // Try to resolve relative imports
    if (specifier.startsWith('.')) {
      const { parentURL } = context;
      if (parentURL) {
        const parentPath = new URL(parentURL).pathname;
        const parentDir = resolvePath(parentPath, '..');
        const tsPath = resolvePath(parentDir, tsSpecifier);
        
        if (existsSync(tsPath)) {
          return {
            url: pathToFileURL(tsPath).href,
            shortCircuit: true
          };
        }
      }
    }
  }

  // Fall back to default resolution
  return defaultResolve(specifier, context);
}