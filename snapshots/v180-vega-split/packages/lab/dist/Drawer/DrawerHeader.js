// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DrawerHeader.tsx
 * @input Uses React, StyleX, LayoutHeader, Button, Icon, Heading, Text, i18n, BaseProps, mergeProps, themeProps
 * @output Exports DrawerHeader component and DrawerHeaderProps
 * @position Lab Drawer header; composed as the first child of Drawer, tested by DrawerHeader.test.tsx
 *
 * Mirrors DialogHeader's API: a title, an optional subtitle, start/end content
 * slots, and a close button that renders only when `onOpenChange` is passed.
 * Two differences follow from Drawer's contract:
 * - It does not move focus on mount. Drawer owns focus entry through
 *   `data-autofocus` once its native host is presented.
 * - It does not name the drawer. Drawer's required `label` does.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Drawer/DrawerHeader.doc.mjs (props, anatomy, theming)
 * - /packages/lab/src/Drawer/DrawerHeader.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/Drawer/index.ts (exports if types change)
 * - /apps/storybook/stories/Drawer.stories.tsx (examples and visual coverage)
 */
import * as stylex from '@stylexjs/stylex';
import '@astryxdesign/core/theme/tokens.stylex';
import { sizeVars, spacingVars, typeScaleVars } from '@astryxdesign/core/theme/tokens.stylex';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { LayoutHeader } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { useTranslator } from '@astryxdesign/core/i18n';
import { mergeProps, themeProps } from '@astryxdesign/core/utils';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Header for a Drawer: a title, optional subtitle and start/end content, and a
 * close button when `onOpenChange` is passed. Same API as DialogHeader.
 *
 * Uses LayoutHeader internally for consistent styling with other layout headers.
 *
 * @example
 * ```
 * <Drawer isOpen={isOpen} onOpenChange={setIsOpen} label="Details">
 *   <DrawerHeader title="Details" onOpenChange={setIsOpen} />
 *   <Section padding={4}>Content</Section>
 * </Drawer>
 * ```
 */
export function DrawerHeader({
  title,
  subtitle,
  onOpenChange,
  startContent,
  endContent,
  endContentEdgeCompensation,
  hasDivider,
  xstyle,
  className,
  style,
  ref,
  ...rest
}) {
  const t = useTranslator();
  // A node subtitle may be `0`: render it inside Text instead of letting a
  // truthiness check leak a bare text node, and skip only empty values.
  const hasSubtitle = subtitle != null && typeof subtitle !== 'boolean' && subtitle !== '';
  const shouldCompensateEndBlock = endContentEdgeCompensation == null ? onOpenChange != null : endContentEdgeCompensation === 'block' || endContentEdgeCompensation === 'all';
  const shouldCompensateEndInline = endContentEdgeCompensation == null ? onOpenChange != null : endContentEdgeCompensation === 'inline' || endContentEdgeCompensation === 'all';
  return /*#__PURE__*/_jsx(LayoutHeader, {
    ref: ref,
    hasDivider: hasDivider,
    xstyle: xstyle,
    className: className,
    style: style,
    ...rest,
    children: /*#__PURE__*/_jsxs("div", {
      ...mergeProps(themeProps('drawer-header'), {
        className: "x78zum5 x1cy8zhl x1qughib xjcht0a"
      }),
      children: [startContent && /*#__PURE__*/_jsx("div", {
        ...mergeProps(themeProps('drawer-header-start-content'), {
          className: "x78zum5 x6s0dn4 x1txdalj x2lah0s"
        }),
        children: startContent
      }), /*#__PURE__*/_jsxs("div", {
        ...mergeProps(themeProps('drawer-header-title-block'), {
          className: "x78zum5 xdt5ytf xsn7fz1 x98rzlu xeuugli xqixskq"
        }),
        children: [/*#__PURE__*/_jsx(Heading, {
          level: 2,
          children: title
        }), hasSubtitle && /*#__PURE__*/_jsx(Text, {
          type: "body",
          size: "sm",
          color: "secondary",
          children: subtitle
        })]
      }), (endContent || onOpenChange) && /*#__PURE__*/_jsxs("div", {
        ...mergeProps(themeProps('drawer-header-end-content'), {
          0: {
            className: "x78zum5 x6s0dn4 x1txdalj x2lah0s"
          },
          2: {
            className: "x78zum5 x6s0dn4 x1txdalj x2lah0s xhzvc8f"
          },
          1: {
            className: "x78zum5 x6s0dn4 x1txdalj x2lah0s x3kzqx6"
          },
          3: {
            className: "x78zum5 x6s0dn4 x1txdalj x2lah0s xhzvc8f x3kzqx6"
          }
        }[!!shouldCompensateEndBlock << 1 | !!shouldCompensateEndInline << 0]),
        children: [endContent, onOpenChange && /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          label: t('@astryx.dialog.close'),
          tooltip: t('@astryx.dialog.close'),
          icon: /*#__PURE__*/_jsx(Icon, {
            icon: "close",
            color: "inherit",
            ...themeProps('drawer-header-close-icon')
          }),
          onClick: () => {
            onOpenChange(false);
          },
          isIconOnly: true
        })]
      })]
    })
  });
}
DrawerHeader.displayName = 'DrawerHeader';