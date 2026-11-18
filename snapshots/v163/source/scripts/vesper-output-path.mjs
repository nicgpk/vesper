// SPDX-License-Identifier: MIT
/**
 * @input Repository/output paths and a Node path implementation (native by default).
 * @output Throws for filesystem roots, repository ancestors, or source directories.
 * @position Pure Vesper build output guard; never reads, writes, or cleans paths.
 */
import path from 'node:path';

export function assertSafeOutputPath(root, output, pathAPI = path) {
  root = pathAPI.resolve(root);
  output = pathAPI.resolve(output);
  const within = (parent, candidate) => {
    const relative = pathAPI.relative(parent, candidate);
    return (
      relative === '' ||
      (!pathAPI.isAbsolute(relative) &&
        relative !== '..' &&
        !relative.startsWith('..' + pathAPI.sep))
    );
  };
  const baseline = pathAPI.join(root, 'local-baseline');
  if (
    output === pathAPI.parse(output).root ||
    within(output, root) ||
    (within(root, output) &&
      (!within(baseline, output) || pathAPI.relative(baseline, output) === ''))
  ) {
    throw new Error(
      'Output must be outside source files: use local-baseline or an external build directory.',
    );
  }
}
