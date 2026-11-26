// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file headingProjection.ts
 * @input A transformed Markdown AST and prepared plugins
 * @output Released heading identity plus narrow first-party module composition
 * @position Internal Markdown/Outline heading projection seam
 */

import { markdownAstText } from "./ast.js";
import { slugify, uniqueSlug } from "./parser.js";
import { projectMarkdownHeadingLinks } from "./plugins/headingLinks.js";
import { markdownExtensionText } from "./plugins/protocol.js";
/** Project ids once after every Markdown transform has run. */
export function projectMarkdownHeadings(root, preparedPlugins) {
  const rootHeadings = root.children.filter(node => node.type === 'heading');
  const headingLinks = projectMarkdownHeadingLinks(root, preparedPlugins);
  if (headingLinks != null) {
    return {
      ...headingLinks,
      outline: rootHeadings.map(heading => {
        const id = headingLinks.ids.get(heading);
        const label = headingLinks.labels.get(heading);
        if (id == null || label == null) {
          throw new Error('Heading-links projection omitted a root heading');
        }
        return {
          id,
          label,
          level: heading.depth
        };
      })
    };
  }
  const ids = new Map();
  const labels = new Map();
  const counts = new Map();
  const outline = rootHeadings.map(heading => {
    const label = markdownAstText(heading.children, node => markdownExtensionText(preparedPlugins, node)).trim();
    const id = uniqueSlug(slugify(label), counts);
    ids.set(heading, id);
    labels.set(heading, label);
    return {
      id,
      label,
      level: heading.depth
    };
  });
  return {
    ids,
    labels,
    permalinkUrls: new Map(),
    outline
  };
}