"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _helper = _interopRequireDefault(require("./helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default({
  types: t
}) {
  class BabelInlineImport {
    constructor() {
      return {
        visitor: {
          ImportDeclaration: {
            exit(path, state) {
              const givenPath = path.node.source.value;
              let reference = state && state.file && state.file.opts.filename;
              const extensions = state && state.opts && state.opts.extensions;

              if (_helper.default.shouldBeInlined(givenPath, extensions)) {
                if (path.node.specifiers.length > 1) {
                  throw new Error(`Destructuring inlined import is not allowed. Check the import statement for '${givenPath}'`);
                }

                const specifier = path.node.specifiers[0];
                const id = specifier.local.name;

                const content = _helper.default.getContents(givenPath, reference);

                let variableValue = t.stringLiteral(content); // import * as x from ...

                if (specifier.type === 'ImportNamespaceSpecifier') {
                  variableValue = t.objectExpression([t.objectProperty(t.identifier('default'), variableValue)]);
                }

                const variable = t.variableDeclarator(t.identifier(id), variableValue);
                path.replaceWith({
                  type: 'VariableDeclaration',
                  kind: 'const',
                  declarations: [variable],
                  leadingComments: [{
                    type: 'CommentBlock',
                    value: ` babel-plugin-inline-import '${givenPath}' `
                  }]
                });
              }
            }

          },
          CallExpression: {
            exit(path, state) {
              const callee = path.get('callee');
              const arg = path.get('arguments')[0];

              if (callee.isIdentifier() && callee.equals('name', 'require') && arg.type === 'StringLiteral') {
                const givenPath = arg.node.value;
                const extensions = state && state.opts && state.opts.extensions;

                if (_helper.default.shouldBeInlined(givenPath, extensions)) {
                  const reference = state && state.file && state.file.opts.filename;

                  const content = _helper.default.getContents(givenPath, reference);

                  path.replaceWith(t.stringLiteral(content));
                }
              }
            }

          }
        }
      };
    }

  }

  return new BabelInlineImport();
}