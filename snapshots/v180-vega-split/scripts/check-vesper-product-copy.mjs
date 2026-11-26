// SPDX-License-Identifier: MIT
import {readdirSync, readFileSync} from 'node:fs';
import typescript from 'typescript';

const root = new URL('../apps/storybook/vesper/site/', import.meta.url);
// Catch presentation labels, not CSS classes, route IDs, test code, or technical examples.
const banned = /\b(?:illustrat(?:ive|ion)|samples?|prototyp(?:e|es|ing)|dumm(?:y|ies)|mock(?:s|ed|up|ups)?|simulat(?:ion|ions|ed)|fixtures?|authored|demos?|placeholder (?:data|text)|tests?|test(?:ing)? (?:data|mode|account|record|upload|run|message|notification|feedback)|(?:data|mode|account|record|run|message) test)\b/i;
const boilerplate = /\b(?:local only|local conversation|nothing (?:is|was) (?:sent|saved|stored|published)|changes are cleared when you leave this page)\b/i;
const sourceFiles = readdirSync(root).filter(name => /\.(tsx?|mts)$/.test(name) && !/\.d\.ts$/.test(name));
const problems = [];
const metadataKeys = new Set(['id', 'key', 'value', 'className', 'code', 'material', 'covers', 'href', 'src', 'srcSet', 'testID', 'searchTerms', 'variant']);
for (const name of sourceFiles) {
 const source = typescript.createSourceFile(name, readFileSync(new URL(name,root),'utf8'), typescript.ScriptTarget.Latest,true);
 function visit(node){
  if (typescript.isImportDeclaration(node) || typescript.isExportDeclaration(node)) return;
  if ((typescript.isPropertyAssignment(node)||typescript.isJsxAttribute(node)) && metadataKeys.has(node.name.getText(source))) return;
  const literal = typescript.isJsxText(node) || typescript.isStringLiteral(node) || typescript.isTemplateLiteralToken(node) || typescript.isNoSubstitutionTemplateLiteral(node);
  if (literal) {
   const value = node.text.trim();
   // Strings like demo-stage are internal identifiers, not copy.
   if (!/^[a-z0-9]+(?:[-._][a-z0-9]+)+$/i.test(value) && (banned.test(value) || boilerplate.test(value))) {
    const {line}=source.getLineAndCharacterOfPosition(node.getStart(source));
    problems.push(`${name}:${line+1}: ${value}`);
   }
  }
  typescript.forEachChild(node,visit);
 }
 visit(source);
}
if (problems.length) {
 console.error('Write component-facing labels as product copy, not as showcase labels:\n'+problems.join('\n'));
 process.exitCode=1;
} else console.log(`Product copy passed in ${sourceFiles.length} source files.`);
