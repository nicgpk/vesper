/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
/**
 * @input Active Vesper theme and the interactive material gallery.
 * @output Vesper's responsive glass component sample page.
 * @position Local baseline story, separate from upstream component coverage.
 */
import type {Meta, StoryObj} from '@storybook/react';
import {ComponentGallery} from '../vesper/ComponentGallery';

const meta: Meta = {title: 'Core/Themes/Vesper', tags: ['autodocs']};
export default meta;
type Story = StoryObj;

export const Overview: Story = {render: () => <ComponentGallery />};
