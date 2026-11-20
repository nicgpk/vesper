// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Markdown.tsx
 * @input Markdown string, canonical AST, optional plugins and custom renderers
 * @output Exports Markdown component, MarkdownProps, and renderer contracts
 * @position Core implementation; renders markdown as Astryx components
 */
import { Component, Suspense, useMemo, useRef } from 'react';
import { Fragment } from 'react';
import * as stylex from '@stylexjs/stylex';
import "../theme/tokens.stylex.js";
import { colorVars, spacingVars, radiusVars, typeScaleVars, typographyVars, fontWeightVars, borderVars, durationVars, easeVars } from "../theme/tokens.stylex.js";
import { CodeBlock, Code } from "../CodeBlock/index.js";
import { CheckboxList } from "../CheckboxList/CheckboxList.js";
import { CheckboxListItem } from "../CheckboxList/CheckboxListItem.js";
import { Blockquote } from "../Blockquote/Blockquote.js";
import { List } from "../List/List.js";
import { ListItem } from "../List/ListItem.js";
import { Table } from "../Table/Table.js";
import { TableRow } from "../Table/TableRow.js";
import { TableCell } from "../Table/TableCell.js";
import { TableHeaderCell } from "../Table/TableHeaderCell.js";
import { TableHeader } from "../Table/TableHeader.js";
import { TableBody } from "../Table/TableBody.js";
import { mergeProps } from "../utils/index.js";
import { useStreamingText } from "../hooks/useStreamingText.js";
import { computeBoundaries, computeSegments } from "./streaming.js";
import { useTheme } from "../theme/useTheme.js";
import { Citation } from "../Citation/Citation.js";
import { useLinkComponent } from "../Link/useLinkComponent.js";
import { parseInlineAst, parseMarkdownAst, parseMarkdownAstIncremental, createIncrementalState, trimStreamingArtifacts } from "./parser.js";
import { getMarkdownAstLegacyCodeLanguage } from "./ast.js";
import { applyMarkdownTransforms, getMarkdownExtensionRenderer, markdownExtensionText, prepareMarkdownPlugins, reportMarkdownPluginFailure } from "./plugins/protocol.js";
import { getMarkdownFenceProposal } from "./plugins/semanticFence.js";
import { sanitizeMarkdownLinkUrl, sanitizeMarkdownUrl } from "./url.js";
import { projectMarkdownHeadings } from "./headingProjection.js";
import { HeadingLinksRenderer, headingLinksHeadingStyle } from "./plugins/HeadingLinksRenderer.js";
import { themeProps } from "../utils/themeProps.js";
import { useTranslator } from "../i18n/index.js";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * A plugin that transforms text patterns into custom React elements
 * inside Markdown. Applied to parsed text nodes only — code blocks,
 * inline code, math, and other non-prose contexts are unaffected.
 *
 * Follows Lexical's TextMatchTransformer architecture:
 * - `pattern` for initial regex matching
 * - `getEndIndex` for programmatic boundary refinement
 * - `render` for producing the replacement element
 */

/**
 * A citation source referenced inline in the markdown via `[id]` or `【id】`.
 * When `sources` is provided, bracket content matching a source key is rendered
 * as a compact superscript citation pill instead of plain text.
 */
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const ALIGN_MARGIN = {
  start: '0',
  center: 'auto'
};
const BLOCK_ALIGN_MARGIN = {
  start: null,
  center: 'auto'
};
const _temp = {
  k7Eaqz: "xkj4a21",
  "$$css": true
};
const dynamicStyles = {
  proseWidth: maxWidth => [{
    ks0D6T: maxWidth != null ? "xf68679" : maxWidth,
    $$css: true
  }, {
    "--x-maxWidth": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(maxWidth)
  }],
  proseAlign: marginInline => [{
    kUOVxO: marginInline != null ? "xvlecxo" : marginInline,
    $$css: true
  }, {
    "--x-marginInline": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(marginInline)
  }],
  blockWidth: minWidth => [_temp, {
    "--x-minWidth": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(`min(${minWidth}, 100%)`)
  }],
  blockAlign: marginInline => [{
    kUOVxO: marginInline != null ? "xvlecxo" : marginInline,
    $$css: true
  }, {
    "--x-marginInline": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(marginInline)
  }],
  cellMinWidth: minWidth => [{
    k7Eaqz: minWidth != null ? "xkj4a21" : minWidth,
    $$css: true
  }, {
    "--x-minWidth": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(minWidth)
  }]
};
const cellAlignStyles = {
  center: {
    k9WMMc: "x2b8uid",
    $$css: true
  },
  end: {
    k9WMMc: "xp4054r",
    $$css: true
  }
};

/**
 * Cell sizing for Markdown's own default Table part, layered over Table's
 * wrap-mode defaults.
 *
 * Table sizes wrap-mode cells with `max-width: 0` + `word-break: break-word`,
 * and its header cell also applies nowrap + ellipsis. Those defaults zero every
 * column's min-content contribution, so automatic layout divides the container
 * equally: a six-column Markdown table squashes to a few characters per cell,
 * identifiers split mid-word, header labels ellipsize, and nothing ever
 * overflows into the Scroll region that exists to take the width.
 *
 * Here the cell reports an honest min-content, the header wraps instead of
 * truncating, and `box-sizing: content-box` makes the per-column `ch` floor a
 * floor on the text box rather than on the padded border box — so the floor
 * means the same number of characters at every density, with no padding
 * arithmetic to keep in sync with Table's own tokens.
 *
 * Data-driven `Table` keeps its released wrap mode; only Markdown's part is
 * restyled.
 */
const markdownTableCellStyles = {
  cell: {
    kB7OPa: "x1afcbsf",
    ks0D6T: "x1x1rfll",
    kVQacm: "x1rea2x4",
    kHjlTd: "x1mzt3pk",
    k8WAf4: "xce4md1",
    kg3NbH: "xf314gf",
    kTgw9: "x1lldw8n",
    $$css: true
  },
  headerCell: {
    kB7OPa: "x1afcbsf",
    ks0D6T: "x1x1rfll",
    kVQacm: "x1rea2x4",
    kHjlTd: "x1mzt3pk",
    k8WAf4: "xce4md1",
    kg3NbH: "xf314gf",
    kg5iWk: "xbrixnn",
    khDVqt: "xeaf4i8",
    kTgw9: "x1lldw8n",
    $$css: true
  },
  code: {
    kTgw9: "x1lldw8n",
    $$css: true
  }
};

/**
 * Default inline-code renderer inside Markdown table cells. Used only when the
 * consumer supplies no `components.inlineCode`; a custom renderer owns its own
 * wrapping rules.
 */
function MarkdownTableCellCode({
  children
}) {
  return /*#__PURE__*/_jsx(Code, {
    xstyle: markdownTableCellStyles.code,
    children: children
  });
}
const styles = {
  root: {
    kMv6JI: "x9ynric",
    kMwMTN: "x1tgivj0",
    kLWn49: "xw6l6zx",
    kGuDYH: "xjm74w1",
    kzqmXN: "xh8yej3",
    ks0D6T: "x193iq5w",
    k7Eaqz: "xeuugli",
    kHjlTd: "x1mzt3pk",
    $$css: true
  },
  inlineRoot: {
    k1xSpc: "xt0psk2",
    kzqmXN: "x14atkfc",
    ks0D6T: "x1x1rfll",
    kMv6JI: "xjb2p0i",
    kMwMTN: "x1heor9g",
    kLWn49: "x15bjb6t",
    kGuDYH: "x1qlqyl8",
    $$css: true
  },
  headingBase: {
    kMv6JI: "x1g81bgm",
    kMwMTN: "x1tgivj0",
    $$css: true
  },
  h1: {
    kGuDYH: "xcg7oai",
    k63SB2: "x1v68xuy",
    kLWn49: "xfmsba7",
    $$css: true
  },
  h2: {
    kGuDYH: "x1xvnhcw",
    k63SB2: "x12yy4cs",
    kLWn49: "x1cpk1wn",
    $$css: true
  },
  h3: {
    kGuDYH: "xii13ha",
    k63SB2: "x1jcxfy8",
    kLWn49: "xwjzt0u",
    $$css: true
  },
  h4: {
    kGuDYH: "x8tkxat",
    k63SB2: "x2hcmsi",
    kLWn49: "xqerer",
    $$css: true
  },
  h5: {
    kGuDYH: "xsgqta0",
    k63SB2: "xno150v",
    kLWn49: "xo3gurs",
    $$css: true
  },
  h6: {
    kGuDYH: "xw5ohdf",
    k63SB2: "x1pw4frv",
    kLWn49: "xeixjfn",
    $$css: true
  },
  spacingHeadingMajorDefault: {
    keoZOQ: "x13rv44w",
    k1K539: "xep27e5",
    $$css: true
  },
  spacingHeadingMinorDefault: {
    keoZOQ: "x1s1qpeq",
    k1K539: "x1p37lm5",
    $$css: true
  },
  spacingParagraphDefault: {
    keoZOQ: "xj6sv8s",
    k1K539: "xep27e5",
    $$css: true
  },
  spacingCodeblockDefault: {
    keoZOQ: "x1s1qpeq",
    k1K539: "xwh1t77",
    $$css: true
  },
  spacingBlockquoteDefault: {
    keoZOQ: "x1s1qpeq",
    k1K539: "xwh1t77",
    $$css: true
  },
  spacingListDefault: {
    keoZOQ: "xj6sv8s",
    k1K539: "xep27e5",
    $$css: true
  },
  spacingTableDefault: {
    keoZOQ: "x1s1qpeq",
    k1K539: "xwh1t77",
    $$css: true
  },
  spacingHrDefault: {
    keoZOQ: "x13rv44w",
    k1K539: "x4d5cxa",
    $$css: true
  },
  spacingImageDefault: {
    keoZOQ: "xj6sv8s",
    k1K539: "xep27e5",
    $$css: true
  },
  spacingHeadingMajorCompact: {
    keoZOQ: "x1s1qpeq",
    k1K539: "x1p37lm5",
    $$css: true
  },
  spacingHeadingMinorCompact: {
    keoZOQ: "xj6sv8s",
    k1K539: "x14cgwvg",
    $$css: true
  },
  spacingParagraphCompact: {
    keoZOQ: "xcsaf9d",
    k1K539: "x14cgwvg",
    $$css: true
  },
  spacingCodeblockCompact: {
    keoZOQ: "xtbrsbv",
    k1K539: "x1p37lm5",
    $$css: true
  },
  spacingBlockquoteCompact: {
    keoZOQ: "xtbrsbv",
    k1K539: "x1p37lm5",
    $$css: true
  },
  spacingListCompact: {
    keoZOQ: "xcsaf9d",
    k1K539: "x14cgwvg",
    $$css: true
  },
  spacingTableCompact: {
    keoZOQ: "xtbrsbv",
    k1K539: "x1p37lm5",
    $$css: true
  },
  spacingHrCompact: {
    keoZOQ: "xj6sv8s",
    k1K539: "xep27e5",
    $$css: true
  },
  spacingImageCompact: {
    keoZOQ: "xtbrsbv",
    k1K539: "x1p37lm5",
    $$css: true
  },
  noMarginBlockStart: {
    keoZOQ: "xdj266r",
    $$css: true
  },
  noMarginBlockEnd: {
    k1K539: "xat24cr",
    $$css: true
  },
  codeBlockWrapper: {
    ks0D6T: "x193iq5w",
    $$css: true
  },
  tableWrapper: {
    ks0D6T: "x193iq5w",
    "--container-padding-inline-start": "xrhngw9",
    "--container-padding-inline-end": "xjsfl84",
    "--container-padding-block-start": "x1047aw6",
    "--container-padding-block-end": "xax9j7h",
    $$css: true
  },
  blockIndent: {
    kUOVxO: "x1ho7dyk",
    $$css: true
  },
  hr: {
    kMzoRj: "xc342km",
    kEafiO: "x11xkdxz",
    kPef9Z: "x13fuv20",
    kLZC3w: "x1pc3f07",
    $$css: true
  }
};

// ---------------------------------------------------------------------------
// Streaming fade-in animation

// Parse a CSS duration string (e.g. "175ms", "0.15s") to milliseconds.
function parseDuration(value) {
  const ms = value.match(/^([\d.]+)ms$/);
  if (ms) {
    return parseFloat(ms[1]);
  }
  const s = value.match(/^([\d.]+)s$/);
  if (s) {
    return parseFloat(s[1]) * 1000;
  }
  return null;
}

// ---------------------------------------------------------------------------

/**
 * Mutable cursor threaded through the render tree during streaming.
 * Tracks how many text characters we've visited so far. When `offset`
 * crosses `boundary`, newly rendered content is wrapped in a fade-in span.
 */

/**
 * Count the total text characters in inline nodes without rendering.
 * Used to advance the cursor past a block that will be faded as a whole unit.
 */
function countInlineTextLength(nodes) {
  let len = 0;
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        len += node.value.length;
        break;
      case 'inlineCode':
        len += node.value.length;
        break;
      case 'inlineMath':
        len += node.value.length;
        break;
      case 'image':
        len += node.alt.length;
        break;
      case 'strong':
      case 'emphasis':
      case 'delete':
      case 'link':
        len += countInlineTextLength(node.children);
        break;
      case 'break':
        len += 1;
        break;
      case 'citation':
        len += 1;
        break;
      case 'extension':
        len += node.source?.length ?? 0;
        break;
    }
  }
  return len;
}

/**
 * Count total text characters in a block node tree.
 */
function countBlockTextLength(nodes) {
  let len = 0;
  for (const node of nodes) {
    switch (node.type) {
      case 'heading':
      case 'paragraph':
        len += countInlineTextLength(node.children);
        break;
      case 'code':
        len += node.value.length;
        break;
      case 'math':
        len += node.value.length;
        break;
      case 'blockquote':
        len += countBlockTextLength(node.children);
        break;
      case 'list':
        for (const item of node.children) {
          len += countBlockTextLength(item.children);
        }
        break;
      case 'table':
        for (const row of node.children) {
          for (const cell of row.children) {
            len += countInlineTextLength(cell.children);
          }
        }
        break;
      case 'extension':
        len += node.source?.length ?? 0;
        break;
      case 'thematicBreak':
        break;
      case 'image':
        len += node.alt.length;
        break;
    }
  }
  return len;
}
const headingStyles = {
  1: styles.h1,
  2: styles.h2,
  3: styles.h3,
  4: styles.h4,
  5: styles.h5,
  6: styles.h6
};

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Inline plugin matching
// ---------------------------------------------------------------------------

/**
 * Find all plugin matches in a text string and split it into segments
 * of plain text and plugin-rendered elements.
 *
 * Algorithm mirrors `findMatches` in `useLinkify`:
 * 1. Run each plugin's regex against the text
 * 2. Check getEndIndex if provided (default: match.index + match[0].length)
 * 3. If getEndIndex returns false, skip the match
 * 4. Collect all non-overlapping matches, sorted by start (first match wins)
 * 5. Split into text/plugin segments
 */
function applyInlinePlugins(text, plugins) {
  const allMatches = [];
  for (const plugin of plugins) {
    // Reset lastIndex instead of cloning — avoids allocation per call.
    // Safe because text nodes are processed sequentially (no interleaving).
    plugin.pattern.lastIndex = 0;
    let m;
    while ((m = plugin.pattern.exec(text)) !== null) {
      let end;
      if (plugin.getEndIndex) {
        const result = plugin.getEndIndex(text, m);
        if (result === false) {
          continue;
        }
        end = result;
      } else {
        end = m.index + m[0].length;
      }
      allMatches.push({
        start: m.index,
        end,
        match: m,
        plugin
      });
    }
  }

  // Sort by start position (stable sort preserves plugin order for same position)
  allMatches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (first wins)
  const resolved = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.start >= lastEnd) {
      resolved.push(m);
      lastEnd = m.end;
    }
  }
  if (resolved.length === 0) {
    return [{
      type: 'text',
      content: text
    }];
  }
  const segments = [];
  let cursor = 0;
  for (let i = 0; i < resolved.length; i++) {
    const m = resolved[i];

    // Text before this match
    if (m.start > cursor) {
      segments.push({
        type: 'text',
        content: text.slice(cursor, m.start)
      });
    }

    // Plugin element
    segments.push({
      type: 'plugin',
      element: m.plugin.render(m.match, `plugin-${i}`),
      matchLength: m.end - m.start
    });
    cursor = m.end;
  }

  // Remaining text
  if (cursor < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(cursor)
    });
  }
  return segments;
}
class MarkdownPluginBoundary extends Component {
  state = {
    failed: false,
    resetKey: this.props.resetKey,
    resetRenderer: this.props.resetRenderer
  };
  static getDerivedStateFromError() {
    return {
      failed: true
    };
  }
  static getDerivedStateFromProps(props, state) {
    return props.resetKey === state.resetKey && props.resetRenderer === state.resetRenderer ? null : {
      failed: false,
      resetKey: props.resetKey,
      resetRenderer: props.resetRenderer
    };
  }
  componentDidCatch(error) {
    reportMarkdownPluginFailure(this.props.pluginName, 'render', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function useStableMarkdownSyntaxEntries(plugins) {
  const identity = plugins?.syntaxIdentity ?? '';
  const syntaxEntriesRef = useRef(undefined);
  if (syntaxEntriesRef.current == null || syntaxEntriesRef.current.identity !== identity) {
    syntaxEntriesRef.current = {
      identity,
      entries: plugins == null || identity === '' ? undefined : plugins.syntaxEntries
    };
  }
  return syntaxEntriesRef.current.entries;
}

// ---------------------------------------------------------------------------
// Inline renderer
// ---------------------------------------------------------------------------

/**
 * Wrap a text string with a fade-in span for the portion that is "new".
 * If the entire string is old, returns it as-is. If partially new, splits
 * into [old, <span fade>new</span>]. If entirely new, wraps the whole thing.
 */
/** Check if a cursor offset is in the "new" (animating) region */
function wrapTextWithFade(content, cursor, key) {
  const startOffset = cursor.offset;
  cursor.offset += content.length;
  if (!cursor.active) {
    return content;
  }
  const segments = computeSegments(content, startOffset, cursor.boundaries, key);
  if (segments == null) {
    return content;
  }
  const nodes = segments.map(seg => seg.fading ? /*#__PURE__*/_jsx("span", {
    ...{
      className: "x1hc1fzr x19991ni x80gvsz x12w9bfk xlr8y92 x4itv7f"
    },
    children: seg.text
  }, seg.key) : /*#__PURE__*/_jsx("span", {
    children: seg.text
  }, seg.key));
  return /*#__PURE__*/_jsx("span", {
    children: nodes
  }, `wrap-${key}`);
}

/**
 * Context for citation rendering, threaded through the inline/block render tree.
 * Tracks which sources have been cited and assigns sequential display numbers.
 */

function getCitationNumber(ctx, sourceId) {
  let num = ctx.numberMap.get(sourceId);
  if (num == null) {
    num = ctx.nextNumber++;
    ctx.numberMap.set(sourceId, num);
  }
  return num;
}
function renderInline(node, index, onLinkClick, cursor, citationCtx, linkComponent = 'a', inlinePlugins, components, preparedPlugins) {
  switch (node.type) {
    case 'text':
      {
        if (inlinePlugins && inlinePlugins.length > 0) {
          const segments = applyInlinePlugins(node.value, inlinePlugins);
          // If no plugin matched, fall through to the normal path
          // O(1) guard: applyInlinePlugins returns a single text segment when
          // nothing matched — skip the plugin path entirely in that case.
          if (!(segments.length === 1 && segments[0].type === 'text')) {
            const result = [];
            for (let i = 0; i < segments.length; i++) {
              const seg = segments[i];
              if (seg.type === 'text') {
                result.push(wrapTextWithFade(seg.content, cursor, `${index}-seg-${i}`));
              } else {
                // Plugin segment — advance cursor by matchLength
                cursor.offset += seg.matchLength;
                result.push(/*#__PURE__*/_jsx(Fragment, {
                  children: seg.element
                }, `plugin-${index}-${i}`));
              }
            }
            return /*#__PURE__*/_jsx(Fragment, {
              children: result
            }, index);
          }
        }
        return wrapTextWithFade(node.value, cursor, index);
      }
    case 'strong':
      return /*#__PURE__*/_jsx("strong", {
        ...{
          className: "x2mo6ok"
        },
        children: node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins))
      }, index);
    case 'emphasis':
      return /*#__PURE__*/_jsx("em", {
        children: node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins))
      }, index);
    case 'delete':
      return /*#__PURE__*/_jsx("del", {
        ...{
          className: "xv1l7n4"
        },
        children: node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins))
      }, index);
    case 'inlineCode':
      {
        // Track code content length for cursor but don't split inside code
        cursor.offset += node.value.length;
        const InlineCodeComp = components?.inlineCode;
        const codeEl = InlineCodeComp ? /*#__PURE__*/_jsx(InlineCodeComp, {
          children: node.value
        }, index) : /*#__PURE__*/_jsx(Code, {
          children: node.value
        }, index);
        return codeEl;
      }
    case 'inlineMath':
      {
        const MathComp = components?.math;
        if (MathComp == null) {
          return wrapTextWithFade(`$${node.value}$`, cursor, index);
        }
        cursor.offset += node.value.length;
        return /*#__PURE__*/_jsx(MathComp, {
          value: node.value,
          display: "inline"
        }, index);
      }
    case 'link':
      {
        const safeHref = sanitizeMarkdownLinkUrl(node.url);
        if (safeHref == null) {
          // Unsafe URL — render as plain text
          return /*#__PURE__*/_jsx("span", {
            children: node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins))
          }, index);
        }
        const LinkComp = components?.link;
        if (LinkComp) {
          return /*#__PURE__*/_jsx(LinkComp, {
            href: safeHref,
            children: node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins))
          }, index);
        }
        const isExternal = safeHref.startsWith('https://') || safeHref.startsWith('http://');
        const handleClick = onLinkClick ? e => {
          const result = onLinkClick(safeHref, e);
          if (result === false) {
            e.preventDefault();
          }
        } : undefined;
        // Use linkComponent for internal links, native <a> for external links.
        // Framework routers (Next.js, React Router) handle internal navigation;
        // external links with target="_blank" should use a plain anchor.
        const LinkTag = isExternal ? 'a' : linkComponent;
        return /*#__PURE__*/_jsx(LinkTag, {
          href: safeHref,
          onClick: handleClick,
          ...(isExternal ? {
            target: '_blank',
            rel: 'noopener noreferrer'
          } : {}),
          ...{
            className: "xjse4m1 x1bvjpef"
          },
          children: node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins))
        }, index);
      }
    case 'image':
      {
        const safeSrc = sanitizeMarkdownUrl(node.url);
        if (safeSrc == null) {
          return /*#__PURE__*/_jsxs("span", {
            children: ["[", node.alt, "]"]
          }, index);
        }
        const ImageComp = components?.image;
        if (ImageComp) {
          return /*#__PURE__*/_jsx(ImageComp, {
            src: safeSrc,
            alt: node.alt
          }, index);
        }
        return /*#__PURE__*/_jsx("img", {
          src: safeSrc,
          alt: node.alt,
          ...{
            className: "x193iq5w xh6dtrn"
          }
        }, index);
      }
    case 'extension':
      {
        const renderer = getMarkdownExtensionRenderer(preparedPlugins, node);
        const fallback = wrapTextWithFade(node.source ?? markdownExtensionText(preparedPlugins, node), cursor, index);
        if (renderer == null) {
          return fallback;
        }
        let rendered;
        try {
          rendered = renderer.render({
            node
          });
        } catch (error) {
          reportMarkdownPluginFailure(node.plugin, 'render', error);
          return fallback;
        }
        return /*#__PURE__*/_jsx(MarkdownPluginBoundary, {
          pluginName: node.plugin,
          resetKey: node,
          resetRenderer: renderer.render,
          fallback: fallback,
          children: /*#__PURE__*/_jsx(Suspense, {
            fallback: fallback,
            children: rendered
          })
        }, index);
      }
    case 'break':
      cursor.offset += 1;
      return /*#__PURE__*/_jsx("br", {}, index);
    case 'citation':
      {
        cursor.offset += 1;
        if (!citationCtx) {
          // No sources provided — render as plain text
          return /*#__PURE__*/_jsxs("span", {
            children: ["[", node.sourceId, "]"]
          }, index);
        }
        const num = getCitationNumber(citationCtx, node.sourceId);
        const source = citationCtx.sources[node.sourceId] ?? {
          title: node.sourceId
        };
        const citVariant = citationCtx.style === 'number' ? 'number' : 'label';
        const CitationComp = components?.citation;
        const chip = CitationComp ? /*#__PURE__*/_jsx(CitationComp, {
          source: source,
          number: num,
          variant: citVariant
        }, index) : /*#__PURE__*/_jsx(Citation, {
          source: source,
          number: num,
          variant: citVariant
        }, index);
        return chip;
      }
  }
}

// ---------------------------------------------------------------------------
// Block spacing helper
// ---------------------------------------------------------------------------

function getElementSpacing(node, density) {
  const compact = density === 'compact';
  switch (node.type) {
    case 'heading':
      return node.depth <= 3 ? compact ? styles.spacingHeadingMajorCompact : styles.spacingHeadingMajorDefault : compact ? styles.spacingHeadingMinorCompact : styles.spacingHeadingMinorDefault;
    case 'paragraph':
      return compact ? styles.spacingParagraphCompact : styles.spacingParagraphDefault;
    case 'code':
    case 'math':
      return compact ? styles.spacingCodeblockCompact : styles.spacingCodeblockDefault;
    case 'blockquote':
      return compact ? styles.spacingBlockquoteCompact : styles.spacingBlockquoteDefault;
    case 'list':
      return compact ? styles.spacingListCompact : styles.spacingListDefault;
    case 'table':
      return compact ? styles.spacingTableCompact : styles.spacingTableDefault;
    case 'extension':
      return compact ? styles.spacingParagraphCompact : styles.spacingParagraphDefault;
    case 'thematicBreak':
      return compact ? styles.spacingHrCompact : styles.spacingHrDefault;
    case 'image':
      return compact ? styles.spacingImageCompact : styles.spacingImageDefault;
  }
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

/**
 * Content-derived width floors for a Markdown table's columns, in `ch`.
 *
 * Once the cells stop clamping themselves (see `markdownTableCellStyles`),
 * automatic table layout already gives every column its min-content — the
 * longest unbreakable token — so no identifier can split mid-word. That floor
 * is honest but not readable: a prose column's longest word is short, so six
 * prose columns in a narrow container still wrap one word per line. The
 * readable floor lets a column's longest cell wrap to about two lines instead,
 * scaled by that cell's own length and bounded so a table of short columns
 * still fits its container.
 *
 * A header label adds its own floor, so a short-bodied column stays as wide as
 * its label reads on one line, up to a cap past which the label wraps rather
 * than widening the column further.
 *
 * The floors are `ch`, not `px`: they follow the reader's font size, and with
 * `box-sizing: content-box` on the cells they are floors on the text box, so
 * cell padding does not eat into them. Exact tuning lives here, not in the
 * spec.
 */
const TABLE_COLUMN_MIN_CH = 4;
const TABLE_COLUMN_MAX_CH = 24;
const TABLE_COLUMN_TARGET_LINES = 2;
const TABLE_HEADER_ONE_LINE_MAX_CH = 20;
function computeTableColumnMinWidths(node) {
  const [header, ...rows] = node.children;
  if (header == null) {
    return [];
  }
  return header.children.map((cell, colIdx) => {
    const headerLen = countInlineTextLength(cell.children);
    let maxLen = headerLen;
    for (const row of rows) {
      const rowCell = row.children[colIdx];
      if (rowCell != null) {
        const len = countInlineTextLength(rowCell.children);
        if (len > maxLen) {
          maxLen = len;
        }
      }
    }
    // Body floor: the longest cell wraps to about TARGET_LINES lines.
    const bodyFloor = Math.ceil(maxLen / TABLE_COLUMN_TARGET_LINES);
    // Header floor: the label reads on one line up to the one-line cap.
    const headerFloor = Math.min(headerLen, TABLE_HEADER_ONE_LINE_MAX_CH);
    return Math.min(TABLE_COLUMN_MAX_CH, Math.max(TABLE_COLUMN_MIN_CH, bodyFloor, headerFloor));
  });
}
function renderBlock(node, index, blockCount, density, headingLevelStart, onLinkClick, cursor, citationCtx, contentWidthValue, contentAlign, linkComponent = 'a', inlinePlugins, components, preparedPlugins, t, headingProjection) {
  const blockAlignMargin = BLOCK_ALIGN_MARGIN[contentAlign];
  const blockAlignStyle = blockAlignMargin != null ? dynamicStyles.blockAlign(blockAlignMargin) : null;
  const spacing = getElementSpacing(node, density);
  const isFirst = index === 0;
  const isLast = index === blockCount - 1;
  switch (node.type) {
    case 'heading':
      {
        const level = Math.min(node.depth + headingLevelStart - 1, 6);
        const headingChildren = node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins));
        const headingId = headingProjection?.ids.get(node);
        const headingLabel = headingProjection?.labels.get(node) ?? '';
        const permalinkUrl = headingProjection?.permalinkUrls.get(node);
        const HeadingComp = components?.heading;
        if (HeadingComp) {
          return /*#__PURE__*/_jsx(HeadingComp, {
            level: level,
            id: headingId,
            children: headingChildren
          }, index);
        }
        const Tag = `h${level}`;
        if (permalinkUrl == null || headingId == null) {
          return /*#__PURE__*/_jsx(Tag, {
            id: headingId,
            ...mergeProps(themeProps('markdown-heading', {
              density,
              level
            }), stylex.props(styles.headingBase, headingStyles[level], spacing, contentWidthValue != null ? dynamicStyles.proseWidth(contentWidthValue) : null, contentAlign !== 'start' ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign]) : null, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd)),
            children: headingChildren
          }, index);
        }
        return /*#__PURE__*/_jsx(HeadingLinksRenderer, {
          headingId: headingId,
          headingLabel: headingLabel,
          permalinkUrl: permalinkUrl,
          contentWidth: contentWidthValue,
          contentAlign: contentAlign,
          headingTextStyle: [styles.headingBase, headingStyles[level]],
          blockSpacingStyle: [spacing, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd],
          children: /*#__PURE__*/_jsx(Tag, {
            id: headingId,
            ...mergeProps(themeProps('markdown-heading', {
              density,
              level
            }), stylex.props(styles.headingBase, headingLinksHeadingStyle, headingStyles[level])),
            children: headingChildren
          })
        }, index);
      }
    case 'paragraph':
      {
        const paraChildren = node.children.map((c, i) => renderInline(c, i, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins));
        const ParagraphComp = components?.paragraph;
        if (ParagraphComp) {
          return /*#__PURE__*/_jsx(ParagraphComp, {
            children: paraChildren
          }, index);
        }
        // Markdown paragraphs render as <div>, not <p>: inline content can
        // include block-level nodes (images, custom inline components), and a
        // <p> would reparent them, desyncing SSR markup from the hydrated DOM.
        // Block spacing comes from token-based StyleX margins, so the rendered
        // appearance is unchanged. role="paragraph" re-exposes the paragraph
        // role in the accessibility tree (a pure ARIA hint — it does not trigger
        // the parser's block-child reparenting) so prose semantics are preserved
        // without the <p> composition hazard. Consumers who want a real <p>
        // element can still pass components={{paragraph: 'p'}}.
        return /*#__PURE__*/_jsx("div", {
          role: "paragraph",
          ...mergeProps(themeProps('markdown-paragraph', {
            density
          }), stylex.props(spacing, contentWidthValue != null ? dynamicStyles.proseWidth(contentWidthValue) : null, contentAlign !== 'start' ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign]) : null, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd)),
          children: paraChildren
        }, index);
      }
    case 'code':
      {
        // Track codeblock content in cursor for accurate character counting
        cursor.offset += node.value.length;
        const language = getMarkdownAstLegacyCodeLanguage(node) ?? 'plaintext';
        const CodeBlockComp = components?.code;
        if (CodeBlockComp) {
          return /*#__PURE__*/_jsx(CodeBlockComp, {
            code: node.value,
            language: language
          }, index);
        }
        const fallback = /*#__PURE__*/_jsx("div", {
          ...mergeProps(themeProps('markdown-codeblock', {
            density
          }), stylex.props(spacing, styles.codeBlockWrapper, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd)),
          children: /*#__PURE__*/_jsx(CodeBlock, {
            code: node.value,
            language: language,
            isCollapsible: true,
            xstyle: [contentWidthValue != null ? dynamicStyles.blockWidth(contentWidthValue) : undefined, blockAlignStyle]
          })
        }, index);
        const proposal = getMarkdownFenceProposal(node);
        if (proposal == null) {
          return fallback;
        }
        const renderer = getMarkdownExtensionRenderer(preparedPlugins, proposal.node);
        if (renderer == null) {
          return fallback;
        }
        try {
          const rendered = renderer.render({
            node: proposal.node
          });
          if (rendered == null || typeof rendered === 'boolean') {
            return fallback;
          }
          return /*#__PURE__*/_jsx(MarkdownPluginBoundary, {
            pluginName: proposal.node.plugin,
            resetKey: proposal.node,
            resetRenderer: renderer.render,
            fallback: fallback,
            children: /*#__PURE__*/_jsx(Suspense, {
              fallback: fallback,
              children: rendered
            })
          }, index);
        } catch (error) {
          reportMarkdownPluginFailure(proposal.node.plugin, 'render', error);
          return fallback;
        }
      }
    case 'math':
      {
        cursor.offset += node.value.length;
        const MathComp = components?.math;
        if (MathComp == null) {
          return /*#__PURE__*/_jsx("div", {
            role: "paragraph",
            children: `$$${node.value}$$`
          }, index);
        }
        return /*#__PURE__*/_jsx(MathComp, {
          value: node.value,
          display: "block"
        }, index);
      }
    case 'blockquote':
      {
        const BlockquoteComp = components?.blockquote;
        if (BlockquoteComp) {
          const bqC = node.children.map((c, i) => renderBlock(c, i, node.children.length, density, headingLevelStart, onLinkClick, cursor, citationCtx, contentWidthValue, contentAlign, linkComponent, inlinePlugins, components, preparedPlugins, t, headingProjection));
          return /*#__PURE__*/_jsx(BlockquoteComp, {
            children: bqC
          }, index);
        }
        return /*#__PURE__*/_jsx(Blockquote, {
          ...themeProps('markdown-blockquote', {
            density
          }),
          xstyle: [spacing, contentWidthValue != null ? dynamicStyles.proseWidth(contentWidthValue) : undefined, contentAlign !== 'start' ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign]) : undefined, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd],
          children: node.children.map((c, i) => renderBlock(c, i, node.children.length, density, headingLevelStart, onLinkClick, cursor, citationCtx, contentWidthValue, contentAlign, linkComponent, inlinePlugins, components, preparedPlugins, t, headingProjection))
        }, index);
      }
    case 'list':
      {
        // Detect task lists: all items have a checked state
        const isTaskList = node.children.length > 0 && node.children.every(item => item.checked != null);
        if (isTaskList) {
          // Extract labels from task items — render as rich inline content
          const checkedValues = node.children.map((item, i) => ({
            item,
            key: `task-${i}`
          })).filter(({
            item
          }) => item.checked).map(({
            key
          }) => key);
          return /*#__PURE__*/_jsx("div", {
            ...mergeProps(themeProps('markdown-list', {
              density
            }), stylex.props(spacing, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd)),
            children: /*#__PURE__*/_jsx(CheckboxList, {
              label: t('@astryx.markdown.taskList'),
              isLabelHidden: true,
              value: checkedValues,
              xstyle: styles.blockIndent,
              isReadOnly: true,
              density: "compact",
              children: node.children.map((item, i) => {
                const firstChild = item.children[0];
                const isInline = item.children.length === 1 && firstChild?.type === 'paragraph';
                const label = isInline ? /*#__PURE__*/_jsx(_Fragment, {
                  children: firstChild.children.map((c, j) => renderInline(c, j, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins))
                }) : /*#__PURE__*/_jsx(_Fragment, {
                  children: item.children.map((c, j) => renderBlock(c, j, item.children.length, density, headingLevelStart, onLinkClick, cursor, citationCtx, contentWidthValue, contentAlign, linkComponent, inlinePlugins, components, preparedPlugins, t, headingProjection))
                });
                return /*#__PURE__*/_jsx(CheckboxListItem
                // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown task items are rendered from positional AST nodes
                , {
                  value: `task-${i}`,
                  label: label
                }, i);
              })
            })
          }, index);
        }
        return /*#__PURE__*/_jsx("div", {
          ...mergeProps(themeProps('markdown-list', {
            density
          }), stylex.props(spacing, contentWidthValue != null ? dynamicStyles.proseWidth(contentWidthValue) : null, contentAlign !== 'start' ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign]) : null, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd)),
          children: /*#__PURE__*/_jsx(List, {
            listStyle: node.ordered ? 'decimal' : 'disc',
            density: "compact",
            start: node.ordered ? node.start : undefined,
            xstyle: styles.blockIndent,
            children: node.children.map((item, i) => {
              const firstChild = item.children[0];
              const isInline = item.children.length === 1 && firstChild?.type === 'paragraph';

              // Check if this entire list item is "new" — if so, fade the
              // whole item as a block instead of fading individual text spans.

              const label = isInline ? /*#__PURE__*/_jsx(_Fragment, {
                children: firstChild.children.map((c, j) => renderInline(c, j, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, components, preparedPlugins))
              }) : /*#__PURE__*/_jsx(_Fragment, {
                children: item.children.map((c, j) => renderBlock(c, j, item.children.length, density, headingLevelStart, onLinkClick, cursor, citationCtx, contentWidthValue, contentAlign, linkComponent, inlinePlugins, components, preparedPlugins, t, headingProjection))
              });
              return /*#__PURE__*/_jsx(ListItem
              // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown list items are rendered from positional AST nodes
              , {
                label: label
              }, i);
            })
          })
        }, index);
      }
    case 'table':
      {
        const colMinWidths = computeTableColumnMinWidths(node);
        const [header, ...rows] = node.children;
        // Inline code inside a cell keeps its token whole, through the same
        // `components` seam consumers use. A supplied renderer owns its own
        // wrapping and is left alone.
        const cellComponents = components?.inlineCode != null ? components : {
          ...components,
          inlineCode: MarkdownTableCellCode
        };
        return /*#__PURE__*/_jsx("div", {
          ...mergeProps(themeProps('markdown-table', {
            density
          }), stylex.props(styles.tableWrapper, spacing, contentWidthValue != null ? dynamicStyles.blockWidth(contentWidthValue) : null, BLOCK_ALIGN_MARGIN[contentAlign] != null ? dynamicStyles.blockAlign(BLOCK_ALIGN_MARGIN[contentAlign]) : null, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd)),
          children: /*#__PURE__*/_jsxs(Table, {
            dividers: "rows",
            textOverflow: "wrap",
            children: [/*#__PURE__*/_jsx(TableHeader, {
              children: /*#__PURE__*/_jsx(TableRow, {
                children: header?.children.map((h, i) => /*#__PURE__*/_jsx(TableHeaderCell
                // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown table columns are positional by definition
                , {
                  xstyle: [markdownTableCellStyles.headerCell, dynamicStyles.cellMinWidth(`${colMinWidths[i]}ch`), node.align[i] === 'center' && cellAlignStyles.center, node.align[i] === 'right' && cellAlignStyles.end],
                  children: h.children.map((c, j) => renderInline(c, j, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, cellComponents, preparedPlugins))
                }, i))
              })
            }), /*#__PURE__*/_jsx(TableBody, {
              children: rows.map((row, i) => {
                const cells = row.children.map((cell, j) => /*#__PURE__*/_jsx(TableCell
                // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown table cells are positional by row and column
                , {
                  xstyle: [markdownTableCellStyles.cell, node.align[j] === 'center' && cellAlignStyles.center, node.align[j] === 'right' && cellAlignStyles.end],
                  children: cell.children.map((c, k) => renderInline(c, k, onLinkClick, cursor, citationCtx, linkComponent, inlinePlugins, cellComponents, preparedPlugins))
                }, j));
                return /*#__PURE__*/_jsx(TableRow
                // eslint-disable-next-line @eslint-react/no-array-index-key -- markdown table rows are rendered from positional AST nodes
                , {
                  children: cells
                }, i);
              })
            })]
          })
        }, index);
      }
    case 'extension':
      {
        const renderer = getMarkdownExtensionRenderer(preparedPlugins, node);
        const fallbackText = node.source ?? markdownExtensionText(preparedPlugins, node);
        const fallback = wrapTextWithFade(fallbackText, cursor, index);
        let content = fallback;
        if (renderer != null) {
          try {
            const rendered = renderer.render({
              node
            });
            content = /*#__PURE__*/_jsx(MarkdownPluginBoundary, {
              pluginName: node.plugin,
              resetKey: node,
              resetRenderer: renderer.render,
              fallback: fallback,
              children: /*#__PURE__*/_jsx(Suspense, {
                fallback: fallback,
                children: rendered
              })
            });
          } catch (error) {
            reportMarkdownPluginFailure(node.plugin, 'render', error);
          }
        }
        return /*#__PURE__*/_jsx("div", {
          ...stylex.props(spacing, contentWidthValue != null ? dynamicStyles.proseWidth(contentWidthValue) : null, contentAlign !== 'start' ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign]) : null, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd),
          children: content
        }, index);
      }
    case 'thematicBreak':
      {
        const HrComp = components?.hr;
        if (HrComp) {
          return /*#__PURE__*/_jsx(HrComp, {}, index);
        }
        return /*#__PURE__*/_jsx("hr", {
          ...mergeProps(themeProps('markdown-hr', {
            density
          }), stylex.props(styles.hr, spacing, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd))
        }, index);
      }
    case 'image':
      {
        const safeSrc = sanitizeMarkdownUrl(node.url);
        if (safeSrc == null) {
          return /*#__PURE__*/_jsxs("div", {
            ...mergeProps(themeProps('markdown-image', {
              density
            }), stylex.props(spacing, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd)),
            children: ["[", node.alt, "]"]
          }, index);
        }
        const ImageComp = components?.image;
        if (ImageComp) {
          return /*#__PURE__*/_jsx(ImageComp, {
            src: safeSrc,
            alt: node.alt
          }, index);
        }
        return /*#__PURE__*/_jsx("div", {
          ...mergeProps(themeProps('markdown-image', {
            density
          }), stylex.props(spacing, isFirst && styles.noMarginBlockStart, isLast && styles.noMarginBlockEnd)),
          children: /*#__PURE__*/_jsx("img", {
            src: safeSrc,
            alt: node.alt,
            ...{
              className: "x193iq5w xh6dtrn"
            }
          })
        }, index);
      }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a markdown string as Astryx components. Supports streaming with
 * smooth fade-in animation via isStreaming.
 *
 * @example
 * ```
 * <Markdown>
 *   {'# Hello\n\nThis is **bold** and _italic_ text.\n\n- Item one\n- Item two'}
 * </Markdown>
 * ```
 */
export function Markdown({
  ref,
  children,
  display = 'block',
  density = 'default',
  headingLevelStart = 1,
  isStreaming = false,
  onLinkClick,
  sources,
  citationStyle = 'label',
  contentWidth = 680,
  contentAlign = 'start',
  components,
  plugins,
  inlinePlugins,
  autolink,
  xstyle,
  className,
  style,
  id: rootId,
  'data-testid': testId,
  ...props
}) {
  const t = useTranslator();
  const LinkComponent = useLinkComponent();
  // Derive the set of source IDs for the parser (stable across renders when sources don't change)
  const sourceIds = useMemo(() => sources ? new Set(Object.keys(sources)) : undefined, [sources]);
  const preparedPlugins = useMemo(() => {
    if (plugins == null) {
      return undefined;
    }
    try {
      return prepareMarkdownPlugins(plugins);
    } catch (error) {
      reportMarkdownPluginFailure('configuration', 'transform', error);
      return undefined;
    }
  }, [plugins]);
  const syntaxPlugins = useStableMarkdownSyntaxEntries(preparedPlugins);
  const hasMathRenderer = components?.math != null;
  const legacyParseOptions = useMemo(() => ({
    sourceIds,
    autolink,
    plugins: syntaxPlugins
  }), [sourceIds, autolink, syntaxPlugins]);
  const mathParseOptions = useMemo(() => ({
    sourceIds,
    autolink,
    math: true,
    plugins: syntaxPlugins
  }), [sourceIds, autolink, syntaxPlugins]);

  // Smooth bursty streamed chunks into a steady character-by-character reveal.
  // When not streaming, the hook returns children unchanged (no-op).
  const smoothedText = useStreamingText(children, isStreaming);
  const incrementalStateRef = useRef(createIncrementalState());
  // Reset incremental cache when parser-affecting component options toggle —
  // cached settled blocks were parsed with the previous setting.
  const prevAutolinkRef = useRef(autolink);
  const prevMathRef = useRef(hasMathRenderer);
  if (prevAutolinkRef.current !== autolink || prevMathRef.current !== hasMathRenderer) {
    incrementalStateRef.current = createIncrementalState();
    prevAutolinkRef.current = autolink;
    prevMathRef.current = hasMathRenderer;
  }
  const parsedBlocks = useMemo(() => {
    if (display === 'inline') {
      return [];
    }
    if (isStreaming) {
      if (smoothedText === '') {
        incrementalStateRef.current = createIncrementalState();
        return [];
      }
      const options = hasMathRenderer ? mathParseOptions : legacyParseOptions;
      const input = trimStreamingArtifacts(smoothedText, options);
      return (hasMathRenderer ? parseMarkdownAstIncremental(input, incrementalStateRef.current, mathParseOptions) : parseMarkdownAstIncremental(input, incrementalStateRef.current, legacyParseOptions)).children;
    }
    return (hasMathRenderer ? parseMarkdownAst(children, mathParseOptions) : parseMarkdownAst(children, legacyParseOptions)).children;
  }, [display, smoothedText, children, isStreaming, hasMathRenderer, mathParseOptions, legacyParseOptions]);
  const transformSource = isStreaming ? trimStreamingArtifacts(smoothedText, hasMathRenderer ? mathParseOptions : legacyParseOptions) : children;
  const blocks = useMemo(() => applyMarkdownTransforms({
    type: 'root',
    children: parsedBlocks
  }, preparedPlugins, transformSource, !isStreaming, 'block').children, [parsedBlocks, preparedPlugins, transformSource, isStreaming]);

  // Resolve one post-transform projection for Markdown and derived Outline.
  // The default remains root-only; installed first-party modules own any
  // alternative projection returned through this narrow integration seam.
  const headingProjection = useMemo(() => {
    if (display === 'inline' || blocks.length === 0) {
      return undefined;
    }
    return projectMarkdownHeadings({
      type: 'root',
      children: blocks
    }, preparedPlugins);
  }, [display, blocks, preparedPlugins]);
  const parsedInlineNodes = useMemo(() => {
    if (display !== 'inline') {
      return [];
    }
    const options = hasMathRenderer ? mathParseOptions : legacyParseOptions;
    const input = isStreaming ? trimStreamingArtifacts(smoothedText, options) : children;
    return hasMathRenderer ? parseInlineAst(input, mathParseOptions) : parseInlineAst(input, legacyParseOptions);
  }, [display, smoothedText, children, isStreaming, hasMathRenderer, mathParseOptions, legacyParseOptions]);
  const inlineTransformSource = isStreaming ? trimStreamingArtifacts(smoothedText, hasMathRenderer ? mathParseOptions : legacyParseOptions) : children;
  const inlineNodes = useMemo(() => {
    if (display !== 'inline') {
      return [];
    }
    const transformed = applyMarkdownTransforms({
      type: 'root',
      children: [{
        type: 'paragraph',
        children: parsedInlineNodes
      }]
    }, preparedPlugins, inlineTransformSource, !isStreaming, 'inline');
    const paragraph = transformed.children[0];
    return paragraph?.type === 'paragraph' ? [...paragraph.children] : parsedInlineNodes;
  }, [display, parsedInlineNodes, preparedPlugins, inlineTransformSource, isStreaming]);

  // Track recent boundaries for stacked fade-in animation.
  // The number of spans needed = ceil(animationDuration / tickInterval).
  // useStreamingText ticks every ~tickMs, and the fade runs for
  // --duration-fast-max. We compute the span count dynamically so the
  // oldest span has just finished animating when it gets evicted.
  const {
    token
  } = useTheme();
  const maxSpans = useMemo(() => {
    const duration = parseDuration(token('--duration-fast-max')) ?? 230;
    const tick = parseDuration(token('--duration-fast-min'));
    // Tick interval mirrors useStreamingText's timing: base / 10
    const tickMs = tick != null ? Math.max(4, Math.round(tick / 10)) : 50;
    return Math.min(Math.ceil(duration / tickMs), 12);
  }, [token]);
  const prevBlocksRef = useRef([]);
  const prevInlineNodesRef = useRef([]);
  const boundariesRef = useRef([]);
  const smoothedLen = smoothedText.length;
  const boundaries = useMemo(() => {
    void smoothedLen; // dep trigger
    const prevLen = display === 'inline' ? countInlineTextLength(prevInlineNodesRef.current) : countBlockTextLength(prevBlocksRef.current);
    const next = computeBoundaries(boundariesRef.current, prevLen, maxSpans);
    boundariesRef.current = next;
    return next;
  }, [display, smoothedLen, maxSpans]);
  const cursor = {
    offset: 0,
    boundaries,
    active: isStreaming
  };

  // Build citation context — numbers are assigned in encounter order during rendering.
  // This is recreated each render so numbering stays consistent with the AST.
  const citationCtx = sources ? {
    sources,
    numberMap: new Map(),
    nextNumber: 1,
    style: citationStyle
  } : null;
  if (display === 'inline') {
    const renderedInline = /*#__PURE__*/_jsx("span", {
      ref: ref
      // Consumer props first: what the component sets for itself wins.
      ,
      ...props,
      id: rootId,
      "data-testid": testId,
      ...mergeProps(themeProps('markdown', {
        density
      }), stylex.props(styles.root, styles.inlineRoot, xstyle), className, style),
      children: inlineNodes.map((node, i) => renderInline(node, i, onLinkClick, cursor, citationCtx, LinkComponent, inlinePlugins, components, preparedPlugins))
    });

    // Store current inline nodes for next render's boundary calculation.
    prevInlineNodesRef.current = inlineNodes;
    prevBlocksRef.current = [];
    return renderedInline;
  }
  const rendered = /*#__PURE__*/_jsx("div", {
    ref: ref
    // Consumer props first: what the component sets for itself — the
    // document role included — wins.
    ,
    ...props,
    id: rootId,
    role: "document",
    "data-testid": testId,
    ...mergeProps(themeProps('markdown', {
      density
    }), stylex.props(styles.root, xstyle), className, style),
    children: blocks.map((block, i) => renderBlock(block, i, blocks.length, density, headingLevelStart, onLinkClick, cursor, citationCtx, contentWidth ? typeof contentWidth === 'number' ? `${contentWidth}px` : contentWidth : null, contentAlign, LinkComponent, inlinePlugins, components, preparedPlugins, t, headingProjection))
  });

  // Store current blocks for next render's boundary calculation.
  // This ref write is safe under StrictMode: both invocations produce the same
  // blocks (same smoothedText → same useMemo result), so both write the same value.
  prevBlocksRef.current = blocks;
  prevInlineNodesRef.current = [];
  return rendered;
}
Markdown.displayName = 'Markdown';