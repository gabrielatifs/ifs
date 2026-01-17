const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const missingImports = [];

const extensions = ['', '.js', '.jsx', '.ts', '.tsx'];
const indexFiles = ['index.js', 'index.jsx', 'index.ts', 'index.tsx'];

function getAllFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
            getAllFiles(filePath, fileList);
          }
        } else if (/\.(jsx?|tsx?)$/.test(file)) {
          fileList.push(filePath);
        }
      } catch (err) {}
    });
  } catch (err) {}
  return fileList;
}

function fileExists(filePath) {
  for (const ext of extensions) {
    try {
      if (fs.existsSync(filePath + ext)) return true;
    } catch (err) {}
  }
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      for (const indexFile of indexFiles) {
        if (fs.existsSync(path.join(filePath, indexFile))) return true;
      }
    }
  } catch (err) {}
  try {
    for (const indexFile of indexFiles) {
      if (fs.existsSync(path.join(filePath, indexFile))) return true;
    }
  } catch (err) {}
  return false;
}

function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    const lines = content.split('\n');
    for (const line of lines) {
      const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
      if (importMatch) imports.push(importMatch[1]);
      const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]/);
      if (requireMatch) imports.push(requireMatch[1]);
    }
    return imports;
  } catch (err) {
    return [];
  }
}

function resolveImportPath(importPath, sourceFile) {
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) return null;
  if (importPath.startsWith('@/')) {
    const possibleRoots = [path.join(rootDir, 'src'), rootDir];
    for (const root of possibleRoots) {
      const resolvedPath = path.join(root, importPath.slice(2));
      if (fileExists(resolvedPath)) return null;
    }
    return path.join(possibleRoots[0], importPath.slice(2));
  }
  const sourceDir = path.dirname(sourceFile);
  return path.resolve(sourceDir, importPath);
}

function findMissingImports() {
  console.log('Scanning for JavaScript/JSX/TypeScript files...\n');
  const files = getAllFiles(rootDir);
  console.log('Found ' + files.length + ' files to analyze.\n');
  console.log('Checking imports...\n');
  files.forEach(file => {
    const imports = extractImports(file);
    imports.forEach(importPath => {
      const resolvedPath = resolveImportPath(importPath, file);
      if (resolvedPath === null) return;
      if (!fileExists(resolvedPath)) {
        missingImports.push({
          sourceFile: path.relative(rootDir, file),
          importStatement: importPath,
          resolvedPath: path.relative(rootDir, resolvedPath)
        });
      }
    });
  });
  if (missingImports.length === 0) {
    console.log('No missing imports found!');
  } else {
    console.log('Found ' + missingImports.length + ' missing imports:\n');
    console.log('='.repeat(80));
    missingImports.forEach((item, idx) => {
      console.log('\n' + (idx + 1) + '. Missing Import:');
      console.log('   Source file: ' + item.sourceFile);
      console.log('   Import statement: "' + item.importStatement + '"');
      console.log('   Expected location: ' + item.resolvedPath);
    });
    console.log('\n' + '='.repeat(80));
    console.log('\nTotal missing imports: ' + missingImports.length);
  }
}

try {
  findMissingImports();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
