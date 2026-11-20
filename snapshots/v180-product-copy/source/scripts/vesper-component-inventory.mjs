// SPDX-License-Identifier: MIT
/**
 * @input Public exports, consumer docs, and native demo coverage declarations.
 * @output Exact catalog membership and a counted coverage receipt.
 * @position Vesper showcase completeness boundary; no hand-maintained public roster.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import registry from './component-packages.cjs';
const repository = path.resolve(fileURLToPath(new URL('../', import.meta.url)));

export function getComponentInventory(root = repository) {
  const inventory = [];
  for (const pkg of registry.COMPONENT_PACKAGES) {
    const source = path.join(root, pkg.src);
    const names = new Set(
      pkg.layout === 'flat'
        ? registry.flatPackageComponentNames(root, pkg)
        : registry.nestedPackageComponentNames(root, pkg),
    );
    if (pkg.layout === 'nested') {
      const exported = new Set(registry.exportedComponentNames(source));
      // Theme/i18n providers in lowercase directories are public components too.
      for (const entry of fs.readdirSync(source, {withFileTypes: true})) {
        if (!entry.isDirectory()) continue;
        for (const name of registry.documentedComponentNames(
          path.join(source, entry.name),
        )) {
          if (exported.has(name)) names.add(name);
        }
      }
    }
    for (const name of names) inventory.push({name, package: pkg.name});
  }
  return inventory.sort(
    (a, b) =>
      a.name.localeCompare(b.name, 'en') ||
      a.package.localeCompare(b.package, 'en'),
  );
}

export function getCoverage(demos, inventory = getComponentInventory()) {
  const expected = new Set(inventory.map(component => component.name));
  const owners = new Map();
  const unknown = [];
  const duplicates = [];
  for (const demo of demos) {
    for (const name of demo.covers || []) {
      if (!expected.has(name)) unknown.push({name, demoId: demo.id});
      else if (owners.has(name))
        duplicates.push({name, demoIds: [owners.get(name), demo.id]});
      else owners.set(name, demo.id);
    }
  }
  return {
    documentedComponents: inventory.length,
    coveredComponents: owners.size,
    liveExamples: demos.length,
    missing: inventory.filter(component => !owners.has(component.name)),
    unknown,
    duplicates,
    components: inventory.map(component => ({
      ...component,
      demoId: owners.get(component.name) || null,
    })),
  };
}

export function assertCompleteCoverage(demos) {
  const coverage = getCoverage(demos);
  if (
    coverage.missing.length ||
    coverage.unknown.length ||
    coverage.duplicates.length
  ) {
    throw new Error(
      `Native component coverage is incomplete: ${JSON.stringify({missing: coverage.missing, unknown: coverage.unknown, duplicates: coverage.duplicates})}`,
    );
  }
  return coverage;
}
