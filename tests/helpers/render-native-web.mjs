import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { t } from '../../src/i18n/index.ts';
const require = createRequire(import.meta.url);
const native = require('react-native-web');
/** Real React + React Native Web rendering; stub app services, never the View text guard. */
export async function renderCityCard(city) {
  const source = await readFile(
    new URL('../../src/atlas/ModernCityCard.tsx', import.meta.url),
    'utf8',
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  const dependencies = {
    'react-native': native,
    '../i18n': { t },
    '../ui/AppText': {
      AppText: ({ children }) => React.createElement(native.Text, null, children),
    },
    './Action': { Action: ({ label }) => React.createElement(native.Text, null, label) },
    './ArticleAction': { ArticleAction: () => null },
    './RecordDetails': {
      RecordDetails: ({ children }) => React.createElement(native.View, null, children),
    },
    './styles': { atlasStyles: {} },
    '../sources/external': { openExternal: async () => {} },
  };
  vm.runInNewContext(compiled, { exports, require: (id) => dependencies[id] ?? require(id) });
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args.map(String).join(' '));
  try {
    return {
      html: renderToStaticMarkup(React.createElement(exports.ModernCityCard, { city })),
      errors,
    };
  } finally {
    console.error = original;
  }
}
