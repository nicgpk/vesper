/* eslint-disable @astryx/copyright-header -- Original Vesper extension; upstream notices remain in reused source. */
// SPDX-License-Identifier: MIT
// Local Vesper theme comparison using unchanged Astryx components.
/**
 * @input Selected global Vesper theme and real Astryx controls.
 * @output A responsive component sample for palette and interaction review.
 * @position Local baseline story, separate from upstream component coverage.
 */
import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Heading} from '@astryxdesign/core/Heading';

const meta: Meta = {title: 'Core/Themes/Vesper', tags: ['autodocs']};
export default meta;
type Story = StoryObj;

function Components() {
  const [name, setName] = useState('Evening collection');
  return (
    <main
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: 'clamp(8px, 3vw, 32px)',
        fontFamily: 'var(--font-family-body)',
        color: 'var(--color-text-primary)',
      }}>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontSize: 12,
        }}>
        Vesper / Design system
      </p>
      <Heading level={1}>Quiet character. Clear intent.</Heading>
      <p style={{color: 'var(--color-text-secondary)', maxWidth: 620}}>
        Gothic typography and familiar controls, with light and contrast
        palettes. Choose a theme in the toolbar.
      </p>
      <section
        style={{
          background: 'var(--color-background-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-container)',
          padding: 24,
          marginTop: 24,
        }}
        aria-label="Interactive controls">
        <h2 style={{fontSize: 20, marginTop: 0}}>Collection settings</h2>
        <TextInput
          label="Collection name"
          description="A clear name helps people find this collection."
          value={name}
          onChange={setName}
        />
        <div
          style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24}}>
          <Button label="Save changes" variant="primary" />
          <Button label="Preview" variant="secondary" />
          <Button label="Archive" variant="destructive" />
          <Button label="Unavailable" isDisabled />
        </div>
      </section>
      <section
        aria-label="Status variants"
        style={{display: 'flex', gap: 8, flexWrap: 'wrap', margin: '24px 0'}}>
        <Badge label="Information" variant="info" />
        <Badge label="Published" variant="success" />
        <Badge label="Needs review" variant="warning" />
        <Badge label="Action required" variant="error" />
        <Badge label="Draft" variant="neutral" />
      </section>
      <Banner status="info" title="Your changes are local to this preview." />
      <section aria-label="Chart palette" style={{marginTop: 24}}>
        <h2 style={{fontSize: 20}}>Categorical colors</h2>
        <p style={{color: 'var(--color-text-secondary)'}}>
          Labels accompany every color; real chart stories remain in the
          explorer.
        </p>
        <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
          {[
            'blue',
            'orange',
            'purple',
            'green',
            'pink',
            'cyan',
            'red',
            'teal',
            'brown',
            'indigo',
          ].map(color => (
            <div key={color} style={{minWidth: 72}}>
              <div
                aria-hidden
                style={{
                  height: 40,
                  borderRadius: 4,
                  background: `var(--color-data-categorical-${color})`,
                }}
              />
              <span style={{fontSize: 13}}>{color}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
export const Overview: Story = {render: () => <Components />};
