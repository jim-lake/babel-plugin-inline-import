"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.to-string");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _requireResolve = _interopRequireDefault(require("require-resolve"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BabelInlineImportHelper {
  static shouldBeInlined(givenPath, extensions) {
    const accept = typeof extensions === 'string' ? [extensions] : extensions || BabelInlineImportHelper.extensions;

    for (const extension of accept) {
      if (givenPath.endsWith(extension)) {
        return true;
      }
    }

    return false;
  }

  static getContents(givenPath, reference) {
    if (!reference) {
      throw new Error('"reference" argument must be specified');
    }

    const mod = (0, _requireResolve.default)(givenPath, _path.default.resolve(reference));

    if (!mod || !mod.src) {
      throw new Error(`Path '${givenPath}' could not be found for '${reference}'`);
    }

    return _fs.default.readFileSync(mod.src).toString();
  }

  static transformRelativeToRootPath(path, rootPathSuffix) {
    if (this.hasRoot(path)) {
      const withoutRoot = path.substring(1, path.length);
      return `${BabelInlineImportHelper.root}${rootPathSuffix || ''}/${withoutRoot}`;
    }

    if (typeof path === 'string') {
      return path;
    }

    throw new Error('ERROR: No path passed');
  }

  static hasRoot(string) {
    if (typeof string !== 'string') {
      return false;
    }

    return string.substring(0, 1) === '/';
  }

}

exports.default = BabelInlineImportHelper;

_defineProperty(BabelInlineImportHelper, "extensions", ['.raw', '.text', '.graphql']);

_defineProperty(BabelInlineImportHelper, "root", global.rootPath || process.cwd());