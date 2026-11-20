// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @astryxdesign/lab — Experimental Astryx components
 *
 * Components here are functional but not yet hardened for production.
 * They're available in storybook and sandbox for testing and iteration.
 * Once vetted, components graduate to @astryxdesign/core.
 *
 * This package is published to npm ONLY under the @canary dist-tag
 * (npm install @astryxdesign/lab@canary). It is never released as a
 * stable (latest) version.
 */

// Code components — syntax highlighting domain
export { CodeEditor } from "./CodeEditor/index.js";
export { tokenize, tokenizeAsync, SYNC_TOKENIZE_THRESHOLD } from '@astryxdesign/core/CodeBlock';

// InfoTip — accessible info-icon help affordance (RFC facebook/astryx#3349)
export { InfoTip } from "./InfoTip/index.js";

// TransferList — controlled dual-panel collection input
export { TransferList, TransferListSelector, transferListVars } from "./TransferList/index.js";

// Chat — experimental reasoning display
export { ChatReasoning } from "./ChatReasoning/ChatReasoning.js";
export * from "./Chat/index.js";

// Drawer — experimental overlay panel
export { Drawer, DrawerHeader } from "./Drawer/index.js";

// Tour — guided product-tour / NUX walkthrough (facebook/astryx#4239)
export { Tour, TourStep, useTour } from "./Tour/index.js";

// Stat — experimental KPI/metric display
export { Stat } from "./Stat/index.js";

// Schedule — experimental full-calendar views
export * from "./Schedule/index.js";

// SVG Icon system — CSS-variable-driven multi-variation icons
export { SVGIcon, iconVars, variations, opticalSize, xIcon, checkIcon, bellIcon, homeIcon, settingsIcon, calendarIcon, menuIcon, heartIcon, eyeIcon, starIcon, folderIcon, shieldIcon, searchIcon, mailIcon, lockIcon, starterIcons } from "./SVGIcon/index.js";

// Chart components — composable d3-based data visualization
export { Chart, ChartAxis, ChartGrid, ChartBar, ChartLine, ChartArea, ChartErrorBar, ChartCandlestick, ChartDot, ChartDotGL, ChartDotGLInteractive, ChartHeatmapGL, ChartStreamGL, ChartTooltip, ChartLegend, useChart, m4Reduce, useChartColors, useChartRange, getChartColors, getChartColorsFromResolver, compactNumber, currency, percent, shortDate, monthYear } from "./Chart/index.js";

// Radial charts — spider, pie, donut
export { RadialChart, RadialGrid, RadialArea, RadialAxis, RadialSlice, RadialTooltip, useRadial } from "./Radial/index.js";

// 3D charts — projected SVG with interactive rotation
export { ThreeDChart, ThreeDScatter, ThreeDScatterGL, ThreeDBar, ThreeDGrid, ThreeDAxis, ThreeDSurface, use3D } from "./ThreeD/index.js";

// Chart interactions
export { ChartBrush, ChartZoom, ChartSelect, ChartReferenceLine } from "./Chart/index.js";

// Sankey / flow diagrams — ribbon-based flow visualization
export { SankeyChart, SankeyLink, SankeyNode, SankeyLabel, useSankey, SankeyGrid } from "./Sankey/index.js";

// Chart v2 (config model) moved to its own package: @astryxdesign/charts.
// It is no longer re-exported from @astryxdesign/lab.
export * from "./CircularProgress/index.js";

// ListInput — compact editor for short collections of simple records
export * from "./ListInput/index.js";

// LogStream — experimental streaming log viewer
export { LogStream } from "./LogStream/index.js";

// MobileTokenizer — Lab prototype (stack layer 1) of the touch Tokenizer
// flow: summary trigger + stacked manage/add BottomSheets. Graduates to
// Core Tokenizer presentation="bottom-sheet" (stack layer 2).
export { MobileTokenizer } from "./MobileTokenizer/index.js";

// RichTextEditor (RFC facebook/astryx#3899) has graduated out of @astryxdesign/lab
// into its own canary-only package, @astryxdesign/richtext, so it can be canaried
// independently (e.g. into EPS/Nest). Import it from there:
//   import {RichTextEditor, RichTextView} from '@astryxdesign/richtext';