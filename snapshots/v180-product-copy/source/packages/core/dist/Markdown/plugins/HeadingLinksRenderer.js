// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HeadingLinksRenderer.tsx
 * @input A built-in semantic heading and its module-owned identity projection
 * @output Inline heading-permalink copy composition with isolated control geometry
 * @position Internal renderer owned by module:Markdown/headingLinks
 */
import { useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Button } from "../../Button/Button.js";
import { Icon } from "../../Icon/index.js";
import { useClipboard } from "../../hooks/useClipboard.js";
import { useContainerReveal } from "../../hooks/useContainerReveal.js";
import { useTranslator } from "../../i18n/index.js";
import "../../theme/tokens.stylex.js";
import { colorVars, sizeVars, spacingVars } from "../../theme/tokens.stylex.js";
import { mergeProps, rtlStyles } from "../../utils/index.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const COPY_FEEDBACK_MS = 1500;
const COARSE_TARGET = '24px';
const ALIGN_MARGIN = {
  start: '0',
  center: 'auto'
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
  }]
};
const styles = {
  row: {
    k1xSpc: "x78zum5",
    kGNEyG: "xaz6w31",
    k7Eaqz: "xeuugli",
    ks0D6T: "x193iq5w",
    kVQacm: "x1rea2x4",
    kHBbk8: "xc8icb0",
    $$css: true
  },
  heading: {
    kUk6DE: "xkz0k9k",
    k7Eaqz: "xeuugli",
    kqGvvJ: "x10im51j",
    $$css: true
  },
  copyButton: {
    kVAEAm: "x10l6tqk",
    k87sOh: "xwa60dl",
    kzqmXN: "x1fvqzum x1c4064q",
    kZKoxP: "x6k0iem x1d3wnk4",
    k8WAf4: "xt970qd",
    kg3NbH: "xnjsko4",
    kMwMTN: "x1heor9g",
    kMv6JI: "xjb2p0i",
    kGuDYH: "x1qlqyl8",
    k63SB2: "x1pd3egz",
    kLWn49: "x15bjb6t",
    $$css: true
  }
};

/** @internal Applied only while this module owns the built-in heading row. */
export const headingLinksHeadingStyle = styles.heading;
function isUnmodifiedPrimaryActivation(event) {
  return event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

/** @internal Portable renderer composed by Markdown for built-in headings only. */
export function HeadingLinksRenderer({
  children,
  headingId,
  headingLabel,
  permalinkUrl,
  contentWidth,
  contentAlign,
  headingTextStyle,
  blockSpacingStyle
}) {
  const t = useTranslator();
  const copiedLabel = t('@astryx.markdownHeadingLinks.copied');
  const copyLabel = t('@astryx.markdownHeadingLinks.copy', {
    heading: headingLabel || headingId
  });
  const {
    copy,
    isCopied
  } = useClipboard({
    announce: copiedLabel,
    resetAfterMs: COPY_FEEDBACK_MS
  });
  const {
    getContainerProps,
    getContentRevealProps
  } = useContainerReveal();
  const handleClick = useCallback(event => {
    if (!isUnmodifiedPrimaryActivation(event)) {
      return;
    }
    // This is deliberately an honest copy button rather than an anchor: the
    // heading remains an incoming fragment target, while activating the #
    // never mutates location, scrolls, or implies open-in-new-tab semantics.
    void copy(new URL(permalinkUrl, window.location.href).href);
  }, [copy, permalinkUrl]);
  return /*#__PURE__*/_jsxs("div", {
    ...mergeProps(getContainerProps(), stylex.props(styles.row, headingTextStyle, blockSpacingStyle, contentWidth != null ? dynamicStyles.proseWidth(contentWidth) : null, contentAlign !== 'start' ? dynamicStyles.proseAlign(ALIGN_MARGIN[contentAlign]) : null)),
    children: [children, /*#__PURE__*/_jsxs("span", {
      ...{
        className: "x1n2onr6 x1rg5ohu x2lah0s x1vjfegm x1fvqzum x1c4064q x17lnmll xv1l7n4 xjb2p0i x1qlqyl8 x1pd3egz x15bjb6t"
      },
      children: [/*#__PURE__*/_jsx("span", {
        "aria-hidden": "true",
        ...{
          className: "xlshs6z"
        },
        children: "#"
      }), /*#__PURE__*/_jsx(Button, {
        type: "button",
        variant: "ghost",
        size: "sm",
        label: isCopied ? copiedLabel : copyLabel,
        icon: /*#__PURE__*/_jsx("span", {
          "aria-hidden": "true",
          ...{
            className: "x3nfvp2 x6s0dn4 xl56j7k x15vhz18 xlzyvqe"
          },
          children: isCopied ? /*#__PURE__*/_jsx(Icon, {
            icon: "check",
            size: "sm",
            color: "inherit"
          }) : '#'
        }),
        isIconOnly: true,
        onClick: handleClick,
        xstyle: [styles.copyButton, rtlStyles.centerInline('-50%')],
        ...getContentRevealProps({
          isLayoutPreserved: true
        })
      })]
    })]
  });
}