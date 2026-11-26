// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file editorTheme.ts
 * @input Uses StyleX + Astryx design tokens
 * @output Exports sharedEditorTheme(), which builds a Lexical EditorThemeClasses
 *   object mapping Lexical's theme slots to StyleX-generated class names and
 *   normalizes paragraph spacing for editor/view alignment.
 * @position Shared by RichTextEditor.tsx and RichTextView.tsx so editor and
 *   read-only view render identically.
 *
 * SYNC: When modified, keep RichTextEditor.tsx and RichTextView.tsx in sync.
 */

import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { colorVars, spacingVars, radiusVars, typographyVars, typeScaleVars, fontWeightVars } from '@astryxdesign/core/theme/tokens.stylex';
/**
 * Builds the Lexical EditorThemeClasses object. Lexical expects plain
 * class-name strings, which `stylex.props(...).className` yields.
 */
export function sharedEditorTheme() {
  const ulClass = {
    className: "xsq74q5 x31w388 xtaz4m5 x43c9pm"
  }.className ?? '';
  const olClass = {
    className: "xsq74q5 x31w388 x3yw8vx x43c9pm"
  }.className ?? '';
  const ulDepth2Class = {
    className: "x31w388 x43c9pm x10im51j xrylv2j"
  }.className ?? '';
  const ulDepth3Class = {
    className: "x31w388 x43c9pm x10im51j x152237o"
  }.className ?? '';
  const olDepth2Class = {
    className: "x31w388 x43c9pm x10im51j x1rrqm6h"
  }.className ?? '';
  const olDepth3Class = {
    className: "x31w388 x43c9pm x10im51j x19k9dhg"
  }.className ?? '';
  return {
    paragraph: {
      className: "x17ilvqm x14cgwvg"
    }.className,
    heading: {
      h1: {
        className: "x1g81bgm xngnso2 x2mo6ok x1g06x3t"
      }.className,
      h2: {
        className: "x1g81bgm x1603h9y x2mo6ok x1g06x3t"
      }.className,
      h3: {
        className: "x1g81bgm x1c3i2sq x2mo6ok xsq74q5"
      }.className
    },
    quote: {
      className: "x1g06x3t xrxpjvj x126nfab xct1zlm x1t7ytsu x14ydlgx xv1l7n4"
    }.className,
    list: {
      ul: ulClass,
      ol: olClass,
      checklist: {
        className: "xsq74q5 x43c9pm x3ct3a4 x12gdq22"
      }.className,
      listitem: {
        className: "x1yqqeh1 x1sle589"
      }.className,
      nested: {
        listitem: {
          className: "x1yqqeh1 x1sle589"
        }.className
      },
      // Depth arrays cycle via `depth % length`, so three entries give three
      // distinct nesting levels before repeating (disc→circle→square, etc.).
      ulDepth: [ulClass, ulDepth2Class, ulDepth3Class],
      olDepth: [olClass, olDepth2Class, olDepth3Class]
    },
    link: {
      className: "xjse4m1 x1bvjpef x1ypdohk"
    }.className,
    text: {
      bold: {
        className: "x1lvx875"
      }.className,
      italic: {
        className: "x1k4tb9n"
      }.className,
      underline: {
        className: "x1bvjpef"
      }.className,
      strikethrough: {
        className: "xmqliwb"
      }.className,
      code: {
        className: "x9m5x89 xwmxj5m x7a5moj x13f7esw xx3sua9 xeb7xqv"
      }.className
    },
    code: {
      className: "x1lliihq x9m5x89 xwmxj5m x1b2ylru xx3sua9 x141an7d x1g06x3t x126k92a"
    }.className
  };
}