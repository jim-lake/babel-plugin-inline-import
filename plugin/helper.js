const fs = require('fs');
const path = require('path');
const requireResolve = require('require-resolve');

const ROOT = global.rootPath || process.cwd();
const EXTENSTIONS = [
  '.raw',
  '.text',
  '.graphql',
];

exports.shouldBeInlined = shouldBeInlined;
exports.getContents = getContents;
exports.transformRelativeToRootPath = transformRelativeToRootPath;
exports.hasRoot = hasRoot;
exports.extensions = EXTENSTIONS;
exports.root = ROOT;

function shouldBeInlined(givenPath, extensions) {
  const accept = (typeof extensions === 'string')
    ? [extensions]
    : (extensions || EXTENSTIONS);

  for (const extension of accept) {
    if (givenPath.endsWith(extension)) {
      return true;
    }
  }

  return false;
}

function getContents(givenPath, reference) {
  if (!reference) {
    throw new Error('"reference" argument must be specified');
  }

  const mod = requireResolve(givenPath, path.resolve(reference));

  if (!mod || !mod.src) {
    throw new Error(`Path '${givenPath}' could not be found for '${reference}'`);
  }

  return fs.readFileSync(mod.src).toString();
}

function transformRelativeToRootPath(path, rootPathSuffix) {
  if (hasRoot(path)) {
    const withoutRoot = path.substring(1, path.length);
    return `${ROOT}${rootPathSuffix || ''}/${withoutRoot}`;
  }
  if (typeof path === 'string') {
    return path;
  }
  throw new Error('ERROR: No path passed');
}

function hasRoot(string) {
  if (typeof string !== 'string') {
    return false;
  }

  return string.substring(0, 1) === '/';
}
