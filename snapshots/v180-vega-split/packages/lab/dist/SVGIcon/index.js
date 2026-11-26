// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input SVGIcon module
 * @output Re-exports all SVG icon system components, types, utilities, and starter icons
 * @position Entry point for the lab SVG icon system
 */
export { SVGIcon } from "./SVGIcon.js";
export { variations, opticalSize } from "./variations.stylex.js";
export { iconVars } from "./tokens.stylex.js";
export { xIcon, checkIcon, bellIcon, homeIcon, settingsIcon, calendarIcon, menuIcon, heartIcon, eyeIcon, starIcon, folderIcon, shieldIcon, searchIcon, mailIcon, lockIcon, starterIcons } from "./icons.js";

// XIF spec types

// XIF example icons
export { xifCheck, xifHome, xifFile, xifShield, xifBell, xifStar, xifBellOverride, xifExamples } from "./xif-examples.js";

// Path transforms
export { roundCorners, addCurvature, adjustTension, applyPersonality } from "./pathTransforms.js";