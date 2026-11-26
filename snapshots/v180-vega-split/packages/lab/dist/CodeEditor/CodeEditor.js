// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CodeEditor.tsx
 * @input Uses React, StyleX, theme tokens, CSS Custom Highlight API,
 *   VisuallyHidden (core)
 * @output Exports CodeEditor component and CodeEditorProps
 * @position Core implementation; editable code input (lab/experimental)
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/CodeEditor/index.ts (exports if types change)
 * - /packages/lab/src/CodeBlock/tokenizer.ts (shared tokenizer)
 * - /packages/lab/src/CodeBlock/highlightStyles.ts (::highlight rules)
 */

'use client';

import { useEffect, useId, useLayoutEffect, useRef, useCallback, useState } from 'react';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, radiusVars, textSizeVars, typographyVars, typeScaleVars, borderVars } from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps, isImeKeyEvent } from '@astryxdesign/core/utils';
import { tokenize, tokenizeAsync, SYNC_TOKENIZE_THRESHOLD } from '@astryxdesign/core/CodeBlock';
import { themeProps } from '@astryxdesign/core/utils';
import { ensureHighlightStyles, applyHighlightRangesFlat } from '@astryxdesign/core/CodeBlock';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const styles = {
  root: {
    kVAEAm: "x1n2onr6",
    k1xSpc: "x78zum5",
    kaIpWk: "xh6dtrn",
    kWkggS: "xwmxj5m",
    kVQacm: "xb3r6kr",
    $$css: true
  },
  rootFocused: {
    kVAM5u: "xad5do",
    kGVxlE: "x18oyj42",
    $$css: true
  },
  gutter: {
    kmuXW: "x2lah0s",
    k8WAf4: "x8o8v82",
    kZCmMZ: "x1rey3nv",
    kwRFfy: "x1t818jl",
    k9WMMc: "xp4054r",
    kfSwDN: "x87ps6o",
    kMwMTN: "xnbbluu",
    $$css: true
  },
  editor: {
    k1xSpc: "x1lliihq",
    kAzted: "x1cy360x",
    k8WAf4: "x8o8v82",
    kg3NbH: "x1pzlopt",
    kogj98: "x1ghz6dp",
    kMv6JI: "x9m5x89",
    kMwMTN: "x1tgivj0",
    kKi2Bq: "xeq4nuv",
    khDVqt: "x1sdyfia",
    kTgw9: "x1lldw8n",
    kHjlTd: "x1h4wwuj",
    kI3sdo: "x1a2a7pz",
    knGrYV: "x1ftfhsn",
    kLWn49: "x17iicif",
    $$css: true
  },
  placeholder: {
    kVAEAm: "x10l6tqk",
    k87sOh: "xyx6v2t",
    kbCHJM: "x1unci72",
    kMwMTN: "xnbbluu",
    kMv6JI: "x9m5x89",
    kLWn49: "x17iicif",
    kfzvcC: "x47corl",
    kfSwDN: "x87ps6o",
    $$css: true
  },
  sizeSm: {
    kGuDYH: "x1eqnyfr",
    $$css: true
  },
  sizeMd: {
    kGuDYH: "x1j29vfg",
    $$css: true
  },
  gutterSm: {
    kGuDYH: "x1eqnyfr",
    $$css: true
  },
  gutterMd: {
    kGuDYH: "x1j29vfg",
    $$css: true
  }
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasHighlightAPI() {
  return typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';
}
const AUTO_CLOSE_PAIRS = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`'
};

/**
 * Modifier keys that must NOT re-arm Tab indentation after Escape has armed
 * "tab moves focus" mode — otherwise the Shift keydown that precedes
 * Shift+Tab would cancel the mode before Tab arrives.
 */
const MODE_NEUTRAL_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock']);

/** Place a collapsed caret at a character offset within an element's text. */
function setCaretAtTextOffset(el, offset) {
  const sel = window.getSelection();
  if (!sel) {
    return;
  }
  const range = document.createRange();
  let remaining = offset;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (remaining <= length) {
      range.setStart(node, remaining);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    remaining -= length;
    node = walker.nextNode();
  }
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}
let editorInstanceCounter = 0;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * An editable code input using contentEditable="plaintext-only".
 *
 * Uses CSS Custom Highlight API for syntax coloring. Supports
 * auto-indent, tab insertion, Shift+Tab outdent, and bracket auto-closing.
 *
 * Because Tab is captured for indentation, pressing Escape arms a one-shot
 * "tab moves focus" mode so keyboard users can leave the editor (WCAG 2.1.2).
 * The escape is advertised to assistive technology via a visually hidden
 * aria-describedby hint (see `escapeHint`).
 *
 * The editor carries an explicit tabindex="0" (including when read-only) so
 * the scrollable container passes axe's scrollable-region-focusable check.
 *
 * @example
 * ```
 * const [code, setCode] = useState('');
 * <CodeEditor
 *   label="Source code"
 *   value={code}
 *   onChange={setCode}
 *   language="typescript"
 *   hasLineNumbers
 * />
 * ```
 */
export function CodeEditor({
  value,
  onChange,
  language = 'plaintext',
  hasLineNumbers = false,
  isReadOnly = false,
  placeholder,
  maxHeight,
  size = 'md',
  tokenizer: customTokenizer,
  label,
  escapeHint = 'Press Escape then Tab to move focus out of the editor.',
  xstyle,
  className,
  style,
  ref,
  ...props
}) {
  const editorRef = useRef(null);
  const [instanceId] = useState(() => ++editorInstanceCounter);
  const [focused, setFocused] = useState(false);
  const isComposingRef = useRef(false);
  // One-shot "tab moves focus" mode, armed by Escape (WCAG 2.1.2 — the
  // standard escape from a code editor's Tab-to-indent keyboard trap).
  const tabMovesFocusRef = useRef(false);
  const hintId = useId();
  const lines = value.split('\n');

  // Sync textContent with controlled value
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) {
      return;
    }
    if (el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  // Ensure styles are always injected
  useLayoutEffect(() => {
    ensureHighlightStyles();
  }, []);

  // Apply CSS Custom Highlight API ranges — small code
  useLayoutEffect(() => {
    if (value.length >= SYNC_TOKENIZE_THRESHOLD) {
      return;
    }
    if (!hasHighlightAPI()) {
      return;
    }
    const el = editorRef.current;
    if (!el) {
      return;
    }
    const tok = customTokenizer ?? tokenize;
    const tokens = tok(value, language);
    if (tokens.length === 0) {
      return;
    }
    return applyHighlightRangesFlat(el, tokens);
  }, [value, language, customTokenizer, instanceId]);

  // Apply CSS Custom Highlight API ranges — large code (async)
  useEffect(() => {
    if (value.length < SYNC_TOKENIZE_THRESHOLD) {
      return;
    }
    if (!hasHighlightAPI()) {
      return;
    }
    const el = editorRef.current;
    if (!el) {
      return;
    }
    const abortController = new AbortController();
    let cleanup;
    tokenizeAsync(value, language, abortController.signal).then(tokens => {
      if (abortController.signal.aborted) {
        return;
      }
      if (tokens.length === 0) {
        return;
      }
      cleanup = applyHighlightRangesFlat(el, tokens);
    });
    return () => {
      abortController.abort();
      cleanup?.();
    };
  }, [value, language, customTokenizer, instanceId]);
  const handleInput = useCallback(() => {
    if (isComposingRef.current) {
      return;
    }
    const el = editorRef.current;
    if (!el) {
      return;
    }
    const newValue = el.textContent ?? '';
    onChange(newValue);
  }, [onChange]);
  const handleKeyDown = useCallback(e => {
    // Composition keys belong to the IME, not editor commands. The ref
    // also covers keyboards that omit native composition flags.
    if (isReadOnly || isComposingRef.current || isImeKeyEvent(e.nativeEvent)) {
      return;
    }

    // Escape arms one-shot "tab moves focus" mode so keyboard users can
    // leave the editor. Only engage when nothing inside the editor (e.g.
    // an embedded popover/autocomplete) already consumed the Escape.
    if (e.key === 'Escape') {
      if (!e.defaultPrevented) {
        tabMovesFocusRef.current = true;
      }
      return;
    }
    if (e.key === 'Tab') {
      // Tab-moves-focus mode: let the browser handle Tab / Shift+Tab
      // natively so focus leaves the editor. One-shot — disarm.
      if (tabMovesFocusRef.current) {
        tabMovesFocusRef.current = false;
        return;
      }
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        return;
      }
      const el = editorRef.current;
      if (!el) {
        return;
      }

      // Shift+Tab: outdent — remove up to two leading spaces on the
      // current line.
      if (e.shiftKey) {
        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const cursorOffset = preCaretRange.toString().length;
        const fullText = el.textContent ?? '';
        const lineStart = fullText.lastIndexOf('\n', cursorOffset - 1) + 1;
        const line = fullText.slice(lineStart);
        const removeCount = line.startsWith('  ') ? 2 : line.startsWith(' ') ? 1 : 0;
        if (removeCount === 0) {
          return;
        }
        const newText = fullText.slice(0, lineStart) + fullText.slice(lineStart + removeCount);
        el.textContent = newText;
        const removedBeforeCursor = Math.min(removeCount, Math.max(0, cursorOffset - lineStart));
        setCaretAtTextOffset(el, cursorOffset - removedBeforeCursor);
        onChange(newText);
        return;
      }

      // Tab: insert 2 spaces
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode('  ');
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
      onChange(el.textContent ?? '');
      return;
    }

    // Any other non-modifier key re-arms Tab indentation. Modifiers are
    // excluded so Escape → Shift+Tab still moves focus backward (the
    // Shift keydown fires before the Tab keydown).
    if (!MODE_NEUTRAL_KEYS.has(e.key)) {
      tabMovesFocusRef.current = false;
    }

    // Enter key: preserve indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        return;
      }
      const el = editorRef.current;
      if (!el) {
        return;
      }
      const fullText = el.textContent ?? '';

      // Find cursor offset
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(el);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      const cursorOffset = preCaretRange.toString().length;

      // Find current line and its indentation
      const beforeCursor = fullText.slice(0, cursorOffset);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const currentLine = beforeCursor.slice(lastNewline + 1);
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? '';

      // Insert newline + indent
      const insertText = '\n' + indent;
      range.deleteContents();
      const textNode = document.createTextNode(insertText);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
      onChange(el.textContent ?? '');
      return;
    }

    // Auto-close brackets and quotes
    const closeChar = AUTO_CLOSE_PAIRS[e.key];
    if (closeChar) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        return;
      }
      const range = sel.getRangeAt(0);

      // Only auto-close if no text is selected
      if (!range.collapsed) {
        return;
      }
      e.preventDefault();
      const textNode = document.createTextNode(e.key + closeChar);
      range.deleteContents();
      range.insertNode(textNode);
      // Place cursor between the pair
      range.setStart(textNode, 1);
      range.setEnd(textNode, 1);
      sel.removeAllRanges();
      sel.addRange(range);
      const el = editorRef.current;
      if (el) {
        onChange(el.textContent ?? '');
      }
    }
  }, [isReadOnly, onChange]);
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);
  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    handleInput();
  }, [handleInput]);
  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const gutterSizeStyle = size === 'sm' ? styles.gutterSm : styles.gutterMd;
  const showPlaceholder = placeholder && value === '';
  const containerStyle = maxHeight ? {
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
  } : undefined;
  return /*#__PURE__*/_jsx("div", {
    ref: ref,
    ...mergeProps(themeProps('codeeditor', {
      size,
      language
    }), stylex.props(styles.root, focused && styles.rootFocused, xstyle), className, style),
    ...props,
    children: /*#__PURE__*/_jsxs("div", {
      ...{
        className: "x78zum5 x98rzlu xysyzu8"
      },
      style: containerStyle,
      children: [hasLineNumbers && /*#__PURE__*/_jsx("div", {
        ...stylex.props(styles.gutter, gutterSizeStyle),
        "aria-hidden": "true",
        children: lines.map((_, i) => /*#__PURE__*/_jsx("div", {
          ...{
            className: "x9m5x89 x17iicif"
          },
          children: i + 1
        }, i))
      }), /*#__PURE__*/_jsxs("div", {
        style: {
          position: 'relative',
          flex: 1
        },
        children: [showPlaceholder && /*#__PURE__*/_jsx("div", {
          ...stylex.props(styles.placeholder, sizeStyle),
          children: placeholder
        }), /*#__PURE__*/_jsx("code", {
          ref: editorRef
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ,
          contentEditable: isReadOnly ? false : 'plaintext-only'
          // Explicit tabindex: editing hosts have an effective tabIndex of 0
          // already, but axe reads the attribute, and contenteditable is not
          // on its natively-focusable whitelist — without it a maxHeight
          // editor fails scrollable-region-focusable. Also keeps read-only
          // editors keyboard-focusable, like a readonly textarea.
          ,
          tabIndex: 0,
          role: "textbox",
          "aria-multiline": "true",
          "aria-label": label,
          "aria-readonly": isReadOnly,
          "aria-describedby": isReadOnly ? undefined : hintId,
          spellCheck: false,
          onInput: handleInput,
          onKeyDown: handleKeyDown,
          onFocus: () => setFocused(true),
          onBlur: () => {
            setFocused(false);
            tabMovesFocusRef.current = false;
          },
          onCompositionStart: handleCompositionStart,
          onCompositionEnd: handleCompositionEnd,
          ...stylex.props(styles.editor, sizeStyle)
        }), !isReadOnly && /*#__PURE__*/_jsx(VisuallyHidden, {
          id: hintId,
          children: escapeHint
        })]
      })]
    })
  });
}
CodeEditor.displayName = 'CodeEditor';