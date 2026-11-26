// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RichTextEditor.tsx
 * @input Uses React, useId, Lexical (lexical + @lexical/react, composed through
 *   LexicalExtensionComposer), Field, VisuallyHidden, useInputStatusIcon,
 *   mergeProps, design tokens
 * @output Exports an accessibly labelled RichTextEditor component with a flush
 *   top toolbar slot and configurable editable-surface minimum height, RichTextEditorProps,
 *   RichTextEditorStatus, RichTextEditorStatusType, RichTextEditorSize
 * @position Experimental (richtext) implementation; consumed by the package index.ts and
 *   re-exported from @astryxdesign/richtext. Tested by RichTextEditor.test.tsx.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/richtext/src/RichTextEditor.doc.mjs (props table, features, implementation notes)
 * - /packages/richtext/src/RichTextEditor.test.tsx (tests for new/changed behavior)
 * - /packages/richtext/src/index.ts (exports if types change)
 * - /apps/storybook/stories/RichTextEditor.stories.tsx (storybook stories)
 *
 * NOTE: This is an EXPERIMENTAL component in @astryxdesign/richtext (published only under
 * the `@canary` dist-tag, never as stable `latest`). It is the initial landing for the
 * OSS Lexical editor RFC; the goal is graduation to @astryxdesign/core after the
 * Component Specification Protocol. `lexical` and `@lexical/*` are OPTIONAL peer
 * dependencies — install them to use this component.
 */
import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, typographyVars, typeScaleVars } from '@astryxdesign/core/theme/tokens.stylex';
import { sharedEditorTheme } from "./editorTheme.js";
import { Field, inputWrapperStyles, inputStatusBorderStyles, inputStatusHoverShadowStyles, inputStatusFocusWithinStyles } from '@astryxdesign/core/Field';
import { useInputStatusIcon } from '@astryxdesign/core/hooks';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { mergeProps, themeProps } from '@astryxdesign/core/utils';
import { useSize } from '@astryxdesign/core/SizeContext';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { TRANSFORMERS, $convertToMarkdownString } from '@lexical/markdown';
import { $generateHtmlFromNodes } from '@lexical/html';
import { DEFAULT_NODES } from "./editorNodes.js";
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW, defineExtension, KEY_DOWN_COMMAND, KEY_ESCAPE_COMMAND, KEY_TAB_COMMAND, mergeRegister } from 'lexical';

/**
 * Serialized state for an empty editor: a root containing a single empty
 * paragraph. Used by the imperative `clear()` handle.
 *
 * We deliberately reset the editor via `editor.setEditorState(...)` rather than
 * an `editor.update(() => { $getRoot()... })` callback, because `$getRoot` /
 * `$createParagraphNode` are *runtime value* imports from the top-level
 * `lexical` package. In the sandbox's Next build a top-level `lexical` value
 * import forces Babel to transpile lexical's raw `src/*.ts` (which uses
 * `declare` class fields) and fails the build. `parseEditorState` /
 * `setEditorState` are methods on the editor instance, so no top-level
 * `lexical` value import is needed. Setting a fresh state still notifies update
 * listeners, so `onChange` fires.
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const EMPTY_EDITOR_STATE_JSON = JSON.stringify({
  root: {
    children: [{
      children: [],
      direction: null,
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1
    }],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1
  }
});
const styles = {
  wrapper: {
    "--container-padding-inline-start": "xrhngw9",
    "--container-padding-inline-end": "xjsfl84",
    "--container-padding-block-start": "x1047aw6",
    "--container-padding-block-end": "xax9j7h",
    kXwgrk: "xdt5ytf",
    kGNEyG: "x1qjc9v5",
    kOIVth: "xsn7fz1",
    k8WAf4: "x1hp7d8q",
    kg3NbH: "x17a0aqu",
    kAzted: "x65nank",
    $$css: true
  },
  editorBody: {
    kVAEAm: "x1n2onr6",
    kB7OPa: "x9f619",
    kzqmXN: "xh8yej3",
    k8WAf4: "xu0wf1k",
    kg3NbH: "xf314gf",
    $$css: true
  },
  editorBodyWithToolbar: {
    kEafiO: "x178xt8z",
    kPef9Z: "x13fuv20",
    kLZC3w: "x1pc3f07",
    $$css: true
  },
  editorBodyWithStatus: {
    kwRFfy: "xp74n0j",
    $$css: true
  },
  contentEditable: {
    k1xSpc: "x1lliihq",
    kzqmXN: "xh8yej3",
    kMzoRj: "xc342km",
    ksu8eU: "xng3xce",
    kmVPX3: "x1717udv",
    kI3sdo: "x1a2a7pz",
    kMwMTN: "x1tgivj0",
    $$css: true
  },
  disabled: {
    kkrTdU: "x1h6gzvc",
    $$css: true
  }
};
const dynamicStyles = {
  contentEditableMinHeight: minHeight => [{
    kAzted: minHeight != null ? "x82snj4" : minHeight,
    $$css: true
  }, {
    "--x-minHeight": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(minHeight)
  }]
};
const editorBodySizeStyles = {
  sm: {
    $$css: true
  },
  md: {
    $$css: true
  },
  lg: {
    k8WAf4: "xce4md1",
    $$css: true
  }
};

/**
 * Default screen-reader hint advertising the Tab escape. Overridable (or
 * suppressible) via the `tabEscapeHint` prop for localization.
 */
const DEFAULT_TAB_ESCAPE_HINT = 'Press Escape then Tab to move focus out of the editor.';

/**
 * Fraction of `maxLength` at which the character counter begins announcing
 * remaining/over-limit characters to screen readers. Matches TextArea.
 */
const COUNTER_WARNING_THRESHOLD = 0.8;

/**
 * Imperative handle exposed via `ref`. Lets callers focus, clear, and read the
 * editor without wiring a custom plugin. Available after mount.
 */

/**
 * A WYSIWYG rich-text editor built on Lexical, styled with Astryx design
 * tokens. Experimental — ships from `@astryxdesign/richtext` (canary). `lexical` and
 * `@lexical/*` are optional peer dependencies — install them to use this
 * component.
 *
 * The editor is intentionally minimal and extensible: pass `toolbar`, `nodes`,
 * and `plugins` to layer richer behaviour (formatting, mentions, hover cards)
 * on top without forking.
 *
 * The forwarded `RichTextEditorRef` exposes imperative `focus()` and `clear()`
 * methods for callers that manage the editor from outside.
 *
 * @example
 * ```
 * import {RichTextEditor, type RichTextEditorRef} from '@astryxdesign/richtext';
 * const ref = useRef<RichTextEditorRef>(null);
 * <RichTextEditor
 *   ref={ref}
 *   label="Notes"
 *   placeholder="Write something..."
 *   onChange={state => save(JSON.stringify(state.toJSON()))}
 * />
 * ```
 */
export const RichTextEditor = /*#__PURE__*/forwardRef(function RichTextEditor({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  defaultValue,
  onChange,
  placeholder,
  isReadOnly = false,
  isDisabled = false,
  status,
  statusVariant = 'attached',
  width,
  minHeight = '4.5rem',
  labelTooltip,
  size: sizeProp,
  nodes,
  toolbar,
  plugins,
  hasMarkdownShortcuts = true,
  transformers = TRANSFORMERS,
  hasAutoFocus = false,
  tabEscapeHint = DEFAULT_TAB_ESCAPE_HINT,
  maxLength,
  namespace = 'astryx-editor',
  xstyle,
  className,
  style,
  ...rest
}, ref) {
  const size = useSize(sizeProp, 'md');
  const inputID = useId();
  const labelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const placeholderID = useId();
  const counterID = useId();
  const tabEscapeHintID = useId();

  // Plain-text character count, tracked from inside the composer via
  // CharCountPlugin. Only used when maxLength is set.
  const [charCount, setCharCount] = useState(0);

  // Theme is stable per render; build once.
  const themeRef = useRef(null);
  if (themeRef.current === null) {
    themeRef.current = sharedEditorTheme();
  }
  const editable = !isReadOnly && !isDisabled;

  // Stabilize the transformers array so MarkdownShortcutPlugin doesn't
  // re-register on every render. `[...transformers]` would allocate a new
  // array each time; memoize on the prop identity instead. (React Compiler
  // isn't running the transform in this repo, so this isn't auto-memoized.)
  const markdownTransformers = useMemo(() => [...transformers], [transformers]);

  // The extension replaces LexicalComposer's `initialConfig`: it carries the
  // same editor configuration (namespace, theme, nodes, editability, initial
  // state) in the shape LexicalBuilder consumes.
  //
  // LexicalExtensionComposer re-creates the editor whenever the extension's
  // identity changes, whereas LexicalComposer read `initialConfig` exactly once
  // on mount. Build it on first render and keep it, so the editor's lifetime —
  // and the content it holds — is unaffected by later renders (a consumer
  // passing an inline `nodes={[...]}` array would otherwise blow away the
  // editor's content on every render).
  const extensionRef = useRef(null);
  if (extensionRef.current === null) {
    extensionRef.current = defineExtension({
      name: '@astryxdesign/richtext/RichTextEditor',
      namespace,
      theme: themeRef.current,
      editable,
      nodes: nodes ? [...DEFAULT_NODES, ...nodes] : [...DEFAULT_NODES],
      // `undefined` (not `null`) leaves Lexical's default initializer in place,
      // which seeds the empty document with one paragraph — what
      // LexicalComposer did when no `editorState` was given. `null` would mean
      // "start from a genuinely empty root".
      $initialEditorState: defaultValue ?? undefined,
      onError(error) {
        // Surface errors to the host app rather than swallowing them.
        throw error;
      }
    });
  }
  const hasTabEscapeHint = editable && tabEscapeHint !== '';
  const hasToolbar = toolbar != null && typeof toolbar !== 'boolean';
  const {
    statusIcon,
    describedBy: statusTooltipDescribedBy
  } = useInputStatusIcon({
    status,
    statusVariant
  });
  const ariaDescribedBy = [description ? descriptionID : null, statusVariant !== 'tooltip' && status?.message ? statusMessageID : null,
  // Tooltip status renders no FieldStatus message box. Reference the
  // tooltip layer so assistive technology still receives the message.
  statusTooltipDescribedBy, placeholder ? placeholderID : null, maxLength != null ? counterID : null, hasTabEscapeHint ? tabEscapeHintID : null].filter(Boolean).join(' ') || undefined;
  return /*#__PURE__*/_jsxs(Field, {
    label: label,
    isLabelHidden: isLabelHidden,
    description: description,
    inputID: inputID,
    labelID: labelID,
    descriptionID: description ? descriptionID : undefined,
    isOptional: isOptional,
    isRequired: isRequired,
    isDisabled: isDisabled,
    status: status ? {
      type: status.type,
      message: status.message,
      messageID: status.message ? statusMessageID : undefined
    } : undefined,
    statusVariant: statusVariant,
    labelTooltip: labelTooltip,
    width: width,
    children: [/*#__PURE__*/_jsxs("div", {
      ...mergeProps(themeProps('rich-text-editor', {
        size,
        status: status?.type ?? null
      }), stylex.props(inputWrapperStyles.base, styles.wrapper, (isDisabled || isReadOnly) && inputWrapperStyles.disabled, isDisabled && styles.disabled, status && inputStatusBorderStyles[status.type], status && !isDisabled && !isReadOnly && inputStatusHoverShadowStyles[status.type], status && inputStatusFocusWithinStyles[status.type], xstyle), className, style),
      children: [/*#__PURE__*/_jsxs(LexicalExtensionComposer, {
        extension: extensionRef.current,
        contentEditable: null,
        children: [hasToolbar ? toolbar : null, /*#__PURE__*/_jsxs("div", {
          ...stylex.props(styles.editorBody, hasToolbar && styles.editorBodyWithToolbar, !!statusIcon && styles.editorBodyWithStatus, editorBodySizeStyles[size]),
          children: [/*#__PURE__*/_jsxs("div", {
            ...{
              className: "x1n2onr6 xh8yej3 x9ynric xjm74w1 xf9zqsd xw6l6zx"
            },
            children: [/*#__PURE__*/_jsx(RichTextPlugin, {
              contentEditable: /*#__PURE__*/_jsx(EditorContentEditable, {
                id: inputID,
                ariaLabel: isLabelHidden ? label : undefined,
                ariaLabelledBy: isLabelHidden ? undefined : labelID,
                ariaDescribedBy: ariaDescribedBy,
                ariaRequired: isRequired && !isOptional,
                ariaInvalid: status?.type === 'error',
                placeholderText: placeholder,
                placeholderID: placeholderID,
                minHeight: minHeight,
                rest: rest
              }),
              placeholder: null,
              ErrorBoundary: LexicalErrorBoundary
            }), /*#__PURE__*/_jsx(HistoryPlugin, {}), /*#__PURE__*/_jsx(ListPlugin, {}), /*#__PURE__*/_jsx(LinkPlugin, {}), /*#__PURE__*/_jsx(TabIndentationPlugin, {}), /*#__PURE__*/_jsx(TabFocusEscapePlugin, {}), hasMarkdownShortcuts && /*#__PURE__*/_jsx(MarkdownShortcutPlugin, {
              transformers: markdownTransformers
            }), hasAutoFocus && /*#__PURE__*/_jsx(AutoFocusOnMount, {}), onChange && /*#__PURE__*/_jsx(OnChangePlugin, {
              onChange: onChange,
              ignoreHistoryMergeTagChange: true,
              ignoreSelectionChange: true
            }), plugins, /*#__PURE__*/_jsx(EditorRefBridge, {
              editorRef: ref,
              editable: editable,
              transformers: markdownTransformers
            }), maxLength != null && /*#__PURE__*/_jsx(CharCountPlugin, {
              onCountChange: setCharCount
            })]
          }), statusIcon && /*#__PURE__*/_jsx("div", {
            ...{
              className: "x10l6tqk xctzyg x72tfeb x1vjfegm x78zum5 x6s0dn4"
            },
            children: statusIcon
          })]
        })]
      }), hasTabEscapeHint && /*#__PURE__*/_jsx(VisuallyHidden, {
        id: tabEscapeHintID,
        children: tabEscapeHint
      })]
    }), maxLength != null && /*#__PURE__*/_jsxs("div", {
      id: counterID,
      ...{
        0: {
          className: "x78zum5 x13a6bvl xcsaf9d x9ynric x141an7d xv1l7n4"
        },
        1: {
          className: "x78zum5 x13a6bvl xcsaf9d x9ynric x141an7d xjt36v0"
        }
      }[!!(charCount > maxLength) << 0],
      children: [charCount, "/", maxLength, /*#__PURE__*/_jsx(VisuallyHidden, {
        "aria-live": "polite",
        children: charCount >= maxLength * COUNTER_WARNING_THRESHOLD ? charCount > maxLength ? `${charCount - maxLength} characters over limit` : `${maxLength - charCount} characters remaining` : ''
      })]
    })]
  });
});
RichTextEditor.displayName = 'RichTextEditor';

/**
 * Keys that must not cancel an armed Tab escape: Escape (arming again),
 * Tab (the escape itself) and bare modifier presses — the Shift keydown that
 * precedes Shift+Tab must not disarm, or Escape → Shift+Tab could never
 * escape backwards.
 */
const ESCAPE_REARM_EXEMPT_KEYS = new Set(['Escape', 'Tab', 'Shift', 'Control', 'Alt', 'Meta']);

/**
 * WCAG 2.1.2 (No Keyboard Trap) escape for TabIndentationPlugin.
 *
 * TabIndentationPlugin rebinds Tab to indent/outdent, which would otherwise
 * trap keyboard focus inside the editor. This plugin restores an exit: after
 * Escape is pressed, the next Tab (or Shift+Tab) performs native focus
 * movement instead of indenting; pressing any other non-modifier key — or
 * leaving the editor — re-arms indentation.
 *
 * Mechanics: TabIndentationPlugin handles KEY_TAB_COMMAND at
 * COMMAND_PRIORITY_EDITOR (0), the lowest priority, and Lexical runs command
 * listeners from the highest priority down, stopping at the first one that
 * returns true. Registering at COMMAND_PRIORITY_LOW (1) therefore runs first;
 * when the escape is armed we return true WITHOUT calling
 * `event.preventDefault()`, so the indentation handler never sees the event
 * and the browser performs its default Tab focus navigation.
 */
function TabFocusEscapePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    let escapeArmed = false;
    return mergeRegister(editor.registerCommand(KEY_ESCAPE_COMMAND, () => {
      escapeArmed = true;
      // Consumed: this supersedes @lexical/rich-text's default Escape
      // handler (COMMAND_PRIORITY_EDITOR), which blurs the editor and
      // drops focus on the document body — disorienting, and it would
      // immediately disarm via BLUR_COMMAND below. Consumer plugins that
      // handle Escape (e.g. to close a popover) register at a higher
      // priority and still run first.
      return true;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_TAB_COMMAND, () => {
      if (!escapeArmed) {
        return false;
      }
      escapeArmed = false;
      // Consume the command (blocks indentation) but leave the event's
      // default alone so focus moves natively.
      return true;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_DOWN_COMMAND, event => {
      if (escapeArmed && !ESCAPE_REARM_EXEMPT_KEYS.has(event.key)) {
        escapeArmed = false;
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(BLUR_COMMAND, () => {
      escapeArmed = false;
      return false;
    }, COMMAND_PRIORITY_LOW));
  }, [editor]);
  return null;
}

/**
 * Focuses the editor on mount. Split into its own plugin so it runs inside the
 * composer context.
 */
function AutoFocusOnMount() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.focus();
  }, [editor]);
  return null;
}

/**
 * Wires the imperative `RichTextEditorRef` handle. Split into its own plugin so
 * it runs inside the composer context and can reach the `LexicalEditor` via
 * `useLexicalComposerContext()`. Renders nothing.
 *
 * `focus()` and `clear()` are gated on `editable` so a read-only or disabled
 * editor cannot be mutated or focused through the imperative handle — matching
 * the behaviour of the editable surface itself.
 */
function EditorRefBridge({
  editorRef,
  editable,
  transformers
}) {
  const [editor] = useLexicalComposerContext();
  useImperativeHandle(editorRef, () => ({
    focus: () => {
      if (!editable) {
        return;
      }
      editor.focus();
    },
    clear: () => {
      if (!editable) {
        return;
      }
      // Reset to a single empty paragraph via a fresh EditorState. Uses the
      // editor instance's own parse/set methods so we avoid a top-level
      // `lexical` value import (see EMPTY_EDITOR_STATE_JSON). This still
      // notifies update listeners, so `onChange` fires.
      editor.setEditorState(editor.parseEditorState(EMPTY_EDITOR_STATE_JSON));
    },
    getEditorState: () => editor.getEditorState(),
    getMarkdown: () =>
    // $convertToMarkdownString must run inside a read context. Honors the
    // same transformers the editor uses for shortcuts, so custom
    // transformers round-trip to Markdown. `@lexical/markdown` is a
    // subpackage (built dist) — safe, unlike a top-level `lexical` import.
    editor.getEditorState().read(() => $convertToMarkdownString(transformers)),
    getHTML: () =>
    // $generateHtmlFromNodes serializes the whole document (null selection)
    // to HTML; must run in a read context and requires a DOM.
    // `@lexical/html` is a subpackage (built dist) — safe.
    editor.getEditorState().read(() => $generateHtmlFromNodes(editor, null)),
    getEditor: () => editor
  }), [editor, editable, transformers]);
  return null;
}

/**
 * Tracks the editor's plain-text length and reports it to the host component.
 * Split into its own plugin so it runs inside the composer context and can
 * read the editor state via `useLexicalComposerContext()`. Renders nothing.
 */
function CharCountPlugin({
  onCountChange
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // Report the initial count (e.g. seeded via defaultValue) from the mounted
    // root element's text, then track changes via registerTextContentListener,
    // which hands us the plain-text content directly.
    //
    // We deliberately avoid importing `$getRoot` from the top-level `lexical`
    // package: that is a *runtime value* import, and in the sandbox's Next
    // build it forces Babel to transpile lexical's raw `src/*.ts` (which uses
    // `declare` class fields) and fails. Both APIs used here are methods on the
    // editor instance, so no top-level `lexical` value import is needed.
    onCountChange(editor.getRootElement()?.textContent?.length ?? 0);
    return editor.registerTextContentListener(textContent => {
      onCountChange(textContent.length);
    });
  }, [editor, onCountChange]);
  return null;
}

/**
 * Renders the Lexical ContentEditable. Split out so the placeholder
 * discriminated union (`placeholder` + `aria-placeholder` present together, or
 * neither) is satisfied by two concrete branches rather than a spread.
 */
function EditorContentEditable({
  id,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaRequired,
  ariaInvalid,
  placeholderText,
  placeholderID,
  minHeight,
  rest
}) {
  const shared = {
    id,
    role: 'textbox',
    'aria-multiline': 'true',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-required': ariaRequired ? 'true' : undefined,
    'aria-invalid': ariaInvalid ? 'true' : undefined,
    ...stylex.props(styles.contentEditable, dynamicStyles.contentEditableMinHeight(minHeight)),
    ...rest
  };
  if (placeholderText) {
    return /*#__PURE__*/_jsx(ContentEditable, {
      ...shared,
      "aria-placeholder": placeholderText,
      placeholder: () => /*#__PURE__*/_jsx("div", {
        id: placeholderID,
        "aria-hidden": "true",
        ...{
          className: "x10l6tqk x4xegtk x1o0tod x47corl x87ps6o xv1l7n4"
        },
        children: placeholderText
      })
    });
  }
  return /*#__PURE__*/_jsx(ContentEditable, {
    ...shared
  });
}