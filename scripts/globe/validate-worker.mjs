// TypeScript already belongs to the project toolchain; no new parser dependency.
// Parse JavaScript rather than matching words inside strings/comments.
export function assertStandaloneWorker(ts, source) {
  if (typeof source !== 'string' || source.trim().length === 0) throw new Error('Worker is empty');
  const file = ts.createSourceFile(
    'maplibre-worker.mjs',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  if (file.parseDiagnostics.length) throw new Error('Worker JavaScript cannot be parsed');
  function visit(node) {
    if (
      ts.isImportDeclaration(node) ||
      ts.isImportEqualsDeclaration(node) ||
      (ts.isExportDeclaration(node) && node.moduleSpecifier) ||
      (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
    ) {
      throw new Error('Worker is not self-contained; review bundling before redistribution');
    }
    if (
      (ts.isCallExpression(node) || ts.isNewExpression(node)) &&
      ['eval', 'globalThis.eval', 'self.eval', 'Function', 'importScripts'].includes(
        node.expression.getText(file),
      )
    )
      throw new Error('Worker dynamic code execution is disabled');
    ts.forEachChild(node, visit);
  }
  visit(file);
}

// MapLibre 6.14.0 embeds optional plugin loaders (RTL/custom worker modules).
// This physical-only prototype needs none: remove their dynamic imports instead
// of enabling external code loading in a Blob worker without a base URL.
export function preparePhysicalWorker(ts, source) {
  const file = ts.createSourceFile(
    'worker.mjs',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  if (file.parseDiagnostics.length) throw new Error('Worker JavaScript cannot be parsed');
  let disabledImports = 0,
    disabledEvaluations = 0;
  const transformed = ts.transform(file, [
    (context) => {
      const visit = (node) => {
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          disabledImports++;
          return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('Promise'),
              'reject',
            ),
            undefined,
            [
              ts.factory.createNewExpression(ts.factory.createIdentifier('Error'), undefined, [
                ts.factory.createStringLiteral(
                  'External worker modules are disabled in Tarih Atlasi',
                ),
              ]),
            ],
          );
        }
        if (ts.isCallExpression(node) && node.expression.getText(file) === 'globalThis.eval') {
          disabledEvaluations++;
          return ts.factory.createCallExpression(
            ts.factory.createParenthesizedExpression(
              ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createBlock(
                  [
                    ts.factory.createThrowStatement(
                      ts.factory.createNewExpression(
                        ts.factory.createIdentifier('Error'),
                        undefined,
                        [
                          ts.factory.createStringLiteral(
                            'External worker evaluation is disabled in Tarih Atlasi',
                          ),
                        ],
                      ),
                    ),
                  ],
                  true,
                ),
              ),
            ),
            undefined,
            [],
          );
        }
        return ts.visitEachChild(node, visit, context);
      };
      return (node) => ts.visitNode(node, visit);
    },
  ]);
  try {
    const code = ts.createPrinter({ removeComments: false }).printFile(transformed.transformed[0]);
    assertStandaloneWorker(ts, code);
    return { code, disabledImports, disabledEvaluations };
  } finally {
    transformed.dispose();
  }
}
