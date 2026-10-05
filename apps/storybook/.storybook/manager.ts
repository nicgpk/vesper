// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @input Storybook's supported manager API and built-in dark theme.
 * @output Dark explorer chrome around the Gothic component preview.
 * @position Standalone local baseline manager configuration.
 */
import {addons} from 'storybook/manager-api';
import {themes} from 'storybook/theming';

addons.setConfig({theme: themes.dark});
