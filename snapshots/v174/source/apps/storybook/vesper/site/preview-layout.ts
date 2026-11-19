/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Native example identity, independently of its public-symbol coverage.
 * @output Host composition scale; complex previews are not miniature controls.
 * @position Docs-only presentation intent, never component sizing overrides.
 */
export type PreviewLayout = 'control' | 'wide' | 'workspace';
export const previewLayouts: Record<string, PreviewLayout> = {
  'app-shell': 'workspace',
  'native-layout': 'workspace',
  'mobile-navigation': 'workspace',
  'top-navigation': 'workspace',
  'mega-navigation': 'workspace',
  'chat-layout': 'workspace',
  'native-table-composition': 'wide',
  'editorial-content': 'wide',
  'native-markdown': 'wide',
  'code-editor': 'wide',
  'rich-text-editor': 'wide',
  'log-stream': 'wide',
  'chat-composer': 'wide',
  'chat-conversation': 'wide',
  'chat-reactions': 'wide',
  'chat-reasoning': 'wide',
  'chat-parallel-tools': 'wide',
  'chat-response-feedback': 'wide',
  'native-power-search': 'wide',
  'transfer-list': 'wide',
  schedule: 'wide',
  'chart-area': 'wide',
  chart: 'wide',
  'three-d-chart': 'wide',
  'radial-chart': 'wide',
  'sankey-chart': 'wide',
  'chart-dot-gl': 'wide',
  'chart-heatmap-gl': 'wide',
  'chart-stream-gl': 'wide',
  'vega-chart': 'wide',
};
export function getPreviewLayout(id: string): PreviewLayout {
  return previewLayouts[id] ?? 'control';
}
