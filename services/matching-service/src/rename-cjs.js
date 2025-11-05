import fs from 'fs';
import path from 'path';

const dir = 'dist/spec';
function renameJsToCjs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      renameJsToCjs(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      const newPath = fullPath.replace(/\.js$/, ".cjs");
      fs.renameSync(fullPath, newPath);
    }
  }
}

renameJsToCjs(dir);