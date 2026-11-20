/* eslint-disable @astryx/copyright-header -- Original Vesper extension. */
// SPDX-License-Identifier: MIT
/**
 * @input Public built chart, lab and Vega components; local, static fixture data.
 * @output Native chart demos with endpoint headroom, readable 3D framing and exact symbol coverage.
 * @position Vesper component browser; no stories, remote datasets or simulated marks.
 */
import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  Chart,
  ChartAxis,
  ChartGrid,
  ChartLegend,
  ChartSwatch,
  ChartTooltip,
  bar,
  line,
} from '@astryxdesign/charts';
import {
  Chart as LabChart,
  ChartAxis as LabAxis,
  ChartGrid as LabGrid,
  ChartArea,
  ChartBar,
  ChartCandlestick,
  ChartDot,
  ChartDotGL,
  ChartDotGLInteractive,
  ChartHeatmapGL,
  ChartLine,
  ChartStreamGL,
  RadialChart,
  RadialSlice,
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyLabel,
  ThreeDChart,
  ThreeDAxis,
  ThreeDGrid,
  ThreeDBar,
  ThreeDScatter,
  ThreeDScatterGL,
  ThreeDSurface,
  useChartColors,
  type ChartStreamGLHandle,
} from '@astryxdesign/lab';
import {VegaChart} from '@astryxdesign/vega';
import type {Demo} from './demos';

// These are invented, static examples, not API responses or live market data.
const weekly = [
  {day: 'Mon', value: 24, trend: 28, lower: 20, upper: 33, open: 22, close: 29},
  {day: 'Tue', value: 38, trend: 34, lower: 28, upper: 43, open: 38, close: 31},
  {day: 'Wed', value: 31, trend: 37, lower: 29, upper: 45, open: 32, close: 40},
  {day: 'Thu', value: 48, trend: 44, lower: 37, upper: 52, open: 43, close: 49},
  {day: 'Fri', value: 42, trend: 47, lower: 39, upper: 55, open: 50, close: 43},
];
const samples = [
  {x: 0, value: 24},
  {x: 1, value: 38},
  {x: 2, value: 31},
  {x: 3, value: 48},
  {x: 4, value: 42},
  {x: 5, value: 56},
  {x: 6, value: 35},
  {x: 7, value: 49},
  {x: 8, value: 44},
];
const heatCells = [
  {day: 'Mon', row: 'Design', value: 2},
  {day: 'Tue', row: 'Design', value: 5},
  {day: 'Wed', row: 'Design', value: 8},
  {day: 'Thu', row: 'Design', value: 4},
  {day: 'Mon', row: 'Build', value: 7},
  {day: 'Tue', row: 'Build', value: 3},
  {day: 'Wed', row: 'Build', value: 6},
  {day: 'Thu', row: 'Build', value: 9},
  {day: 'Mon', row: 'Review', value: 4},
  {day: 'Tue', row: 'Review', value: 8},
  {day: 'Wed', row: 'Review', value: 2},
  {day: 'Thu', row: 'Review', value: 6},
];
const spatial = [
  {x: 0, y: 2, z: 0},
  {x: 1, y: 4, z: 0},
  {x: 2, y: 3, z: 0},
  {x: 0, y: 4, z: 1},
  {x: 1, y: 8, z: 1},
  {x: 2, y: 6, z: 1},
  {x: 0, y: 3, z: 2},
  {x: 1, y: 5, z: 2},
  {x: 2, y: 4, z: 2},
];
const slices = [
  {label: 'Design', value: 35},
  {label: 'Build', value: 45},
  {label: 'Review', value: 20},
];
const nodes = [
  {id: 'ideas', label: 'Ideas', value: 60},
  {id: 'requests', label: 'Requests', value: 40},
  {id: 'build', label: 'Build', value: 70},
  {id: 'review', label: 'Review', value: 30},
];
const links = [
  {source: 'ideas', target: 'build', value: 45},
  {source: 'ideas', target: 'review', value: 15},
  {source: 'requests', target: 'build', value: 25},
  {source: 'requests', target: 'review', value: 15},
];

/** Probe and release a context; never replace an unavailable GPU plot with SVG. */
function WebGLGuard({children}: {children: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<
    'checking' | 'available' | 'unavailable' | 'lost'
  >('checking');
  useEffect(() => {
    const canvas = document.createElement('canvas');
    try {
      const gl = canvas.getContext('webgl');
      setState(gl ? 'available' : 'unavailable');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setState('unavailable');
    }
    const element = root.current;
    const lost = () => setState('lost');
    element?.addEventListener('webglcontextlost', lost, true);
    return () => element?.removeEventListener('webglcontextlost', lost, true);
  }, []);
  return (
    <div ref={root} className="demo-stack">
      {state === 'available' ? (
        children
      ) : (
        <p className="demo-copy" role="status">
          {state === 'checking'
            ? 'Checking WebGL support…'
            : state === 'lost'
              ? 'The chart stopped drawing. Reopen it to try again.'
              : 'This browser can’t display the interactive chart.'}
        </p>
      )}
    </div>
  );
}

function ConfigChartPreview() {
  const colors = useChartColors().categorical(2);
  const [showTrend, setShowTrend] = useState(true);
  const series = [
    bar('value', {label: 'Completed', color: colors[0]}),
    ...(showTrend ? [line('trend', {label: 'Plan', color: colors[1]})] : []),
  ];
  return (
    <div className="demo-stack">
      <Button
        label={showTrend ? 'Hide plan' : 'Show plan'}
        onClick={() => setShowTrend(v => !v)}
      />
      <Chart
        data={weekly}
        xKey="day"
        series={series}
        height={260}
        title="Weekly work"
        subtitle="Completed work compared with the plan. Hover for exact values."
        grid={<ChartGrid horizontal />}
        axes={
          <>
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
          </>
        }>
        <ChartTooltip series={series} />
      </Chart>
      <ChartLegend
        items={series.map(s => ({
          label: s.label ?? s.dataKeys[0],
          color: s.color ?? colors[0],
          type: s.type,
        }))}
      />
      <div className="demo-row">
        <ChartSwatch color={colors[0]} variant="square" />
        <span>Completed work</span>
      </div>
      <p className="demo-copy">
        Completed: Mon 24, Tue 38, Wed 31, Thu 48, Fri 42. Plan: 28, 34,
        37, 44, 47.
      </p>
    </div>
  );
}

function LabMarksPreview() {
  const palette = useChartColors();
  const colors = palette.categorical(3);
  const [mode, setMode] = useState('combined');
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Button
          label="Bars, line, band & dots"
          onClick={() => setMode('combined')}
        />
        <Button label="Candlesticks" onClick={() => setMode('candles')} />
      </div>
      <LabChart
        data={weekly}
        xKey="day"
        yKeys={['value', 'trend', 'lower', 'upper']}
        height={270}
        label={
          mode === 'combined'
            ? 'Weekly work: completed, planned, and expected range'
            : 'Weekly opening, closing, low, and high values'
        }>
        <LabGrid horizontal />
        {mode === 'combined' ? (
          <>
            <ChartArea yUpper="upper" yLower="lower" color={colors[0]} stroke />
            <ChartBar dataKey="value" color={colors[0]} />
            <ChartLine dataKey="trend" color={colors[1]} strokeWidth={3} />
            <ChartDot dataKey="value" color={colors[2]} radius={5} />
          </>
        ) : (
          <ChartCandlestick
            high="upper"
            low="lower"
            open="open"
            close="close"
            upColor={palette.semantic.positive}
            downColor={palette.semantic.negative}
          />
        )}
        <LabAxis position="bottom" />
        <LabAxis position="left" />
      </LabChart>
      <p className="demo-copy" role="status">
        {mode === 'combined'
          ? 'Bars and dots show completed work. The line is the plan; the band is the expected range.'
          : 'Candles show opening and closing values. Whiskers show the low and high.'}
      </p>
      <details>
        <summary>View underlying values</summary>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Work</th>
              <th>Plan</th>
              <th>Low</th>
              <th>High</th>
              <th>Open</th>
              <th>Close</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map(d => (
              <tr key={d.day}>
                <th>{d.day}</th>
                <td>{d.value}</td>
                <td>{d.trend}</td>
                <td>{d.lower}</td>
                <td>{d.upper}</td>
                <td>{d.open}</td>
                <td>{d.close}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function GLDotsPreview() {
  const colors = useChartColors().categorical(2);
  const [picking, setPicking] = useState(false);
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Button label="GPU scatter" onClick={() => setPicking(false)} />
        <Button label="GPU picking / hover" onClick={() => setPicking(true)} />
      </div>
      <WebGLGuard>
        <LabChart
          key={String(picking)}
          data={samples}
          xKey="x"
          yKeys={['value']}
          // Half a sample interval keeps the radius-7 endpoint marks inside the canvas.
          xDomain={[-0.5, 8.5]}
          height={260}
          label={
            picking
              ? 'Activity by position, with details on hover'
              : 'Activity by position'
          }>
          <LabGrid />
          <LabAxis position="bottom" />
          <LabAxis position="left" />
          {picking ? (
            <ChartDotGLInteractive
              dataKey="value"
              color={colors[1]}
              size={14}
              renderTooltip={datum => (
                <span>
                  Point {String(datum.x)}: {String(datum.value)}
                </span>
              )}
            />
          ) : (
            <ChartDotGL
              dataKey="value"
              color={colors[0]}
              size={14}
              opacity={1}
            />
          )}
        </LabChart>
      </WebGLGuard>
      <p className="demo-copy" role="status">
        {picking
          ? 'Hover over a point to see its value.'
          : 'Turn on point details to inspect a value.'}
      </p>
      <p className="demo-copy">
        Values from left to right: 24, 38, 31, 48, 42, 56, 35, 49, 44.
      </p>
    </div>
  );
}

function HeatmapPreview() {
  const palette = useChartColors();
  return (
    <div className="demo-stack">
      <WebGLGuard>
        <LabChart
          data={heatCells}
          xKey="day"
          yKeys={['value']}
          height={250}
          label="Team activity heatmap, with Design, Build, and Review rows">
          <ChartHeatmapGL
            xKey="day"
            yKey="row"
            valueKey="value"
            colorRange={palette.sequential.blue(5)}
            domain={[0, 10]}
            cellGap={4}
          />
          <LabAxis position="bottom" />
        </LabChart>
      </WebGLGuard>
      <p className="demo-copy">
        Rows, top to bottom: Design 2/5/8/4; Build 7/3/6/9; Review 4/8/2/6.
        Columns: Mon–Thu. Color intensity shows activity on a scale from 0 to 10.
      </p>
    </div>
  );
}

function StreamPlot() {
  const color = useChartColors().categorical(1)[0];
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const seed = useCallback((value: ChartStreamGLHandle | null) => {
    if (frame.current !== null) {cancelAnimationFrame(frame.current);}
    if (!value) {return;}
    // The mark mounts its canvas in a passive effect, which can run after the
    // first animation frame. Wait for the real canvas rather than racing it.
    const replay = () => {
      if (!root.current?.querySelector('canvas')) {
        frame.current = requestAnimationFrame(replay);
        return;
      }
      value.clear();
      samples.forEach(d => value.push(d.x, d.value));
    };
    frame.current = requestAnimationFrame(replay);
  }, []);
  useEffect(
    () => () => {
      if (frame.current !== null) {cancelAnimationFrame(frame.current);}
    },
    [],
  );
  return (
    <div ref={root} className="demo-stack">
      <LabChart
        data={samples}
        xKey="x"
        yKeys={['value']}
        xDomain={[0, 8]}
        yDomain={[0, 65]}
        height={260}
        label="WebGL ring-buffer line replaying nine fixed points">
        <LabGrid />
        <LabAxis position="bottom" />
        <LabAxis position="left" />
        <ChartStreamGL handleRef={seed} color={color} bufferSize={32} />
      </LabChart>
    </div>
  );
}
function StreamPreview() {
  const [replay, setReplay] = useState(0);
  return (
    <div className="demo-stack">
      <Button
        label="Replay points"
        onClick={() => setReplay(n => n + 1)}
      />
      <WebGLGuard>
        <StreamPlot key={replay} />
      </WebGLGuard>
      <p className="demo-copy">
        A real WebGL ring buffer, seeded once per replay; not a live feed.
        Values at x = 0–8: 24, 38, 31, 48, 42, 56, 35, 49, 44.
      </p>
    </div>
  );
}

function RadialPreview() {
  const colors = useChartColors().categorical(3);
  const [donut, setDonut] = useState(true);
  return (
    <div className="demo-stack">
      <Button
        label={donut ? 'Show pie' : 'Show donut'}
        onClick={() => setDonut(v => !v)}
      />
      <RadialChart
        data={slices}
        valueKey="value"
        labelKey="label"
        innerRadius={donut ? 0.6 : 0}
        height={290}
        label="Allocation: Design 35%, Build 45%, Review 20%">
        <RadialSlice colors={colors} labels />
      </RadialChart>
      <ChartLegend
        items={slices.map((d, i) => ({
          label: `${d.label} ${d.value}%`,
          color: colors[i],
          type: 'bar',
        }))}
      />
      <p className="demo-copy">
        Switch chart styles to compare the same allocation.
      </p>
    </div>
  );
}
function SankeyPreview() {
  return (
    <div className="demo-stack">
      <SankeyChart
        nodes={nodes}
        links={links}
        columns={[
          {ids: ['ideas', 'requests'], label: 'Input'},
          {ids: ['build', 'review'], label: 'Outcome'},
        ]}
        height={285}
        minColumnWidth={130}
        label="Workflow: 60 ideas and 40 requests flow into 70 build and 30 review items">
        <SankeyLink />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
      <p className="demo-copy">
        Of 100 items, 70 went to Build and 30 went to Review.
      </p>
    </div>
  );
}
function ThreeDPreview() {
  const palette = useChartColors();
  const colors = palette.categorical(2);
  const [mode, setMode] = useState('bars');
  const narrow = useMediaQuery('(max-width: 639px)');
  const plot = (
    <ThreeDChart
      key={mode}
      data={spatial}
      xKey="x"
      yKey="y"
      zKey="z"
      // Projection scale is min(container width, height) * 0.35. A taller
      // desktop canvas enlarges the plot; on narrow screens it only adds space.
      height={narrow ? 260 : 460}
      azimuth={30}
      elevation={30}
      // Keep bars inside the ground plane without wasting a full sample interval.
      xDomain={[-0.25, 2.25]}
      yDomain={[0, 8]}
      zDomain={[-0.25, 2.25]}
      interactive
      autoRotate={0}
      label={`3D height map. Drag or focus the chart and use arrow keys to rotate.`}>
      <ThreeDGrid />
      {/* Native endpoint labels rotate into marks; use a stable caption below. */}
      <ThreeDAxis labels={false} />
      {mode === 'bars' && (
        <ThreeDBar color={colors[0]} barWidth={0.13} barDepth={0.13} />
      )}
      {mode === 'scatter' && (
        <ThreeDScatter color={colors[1]} radius={7} opacity={1} />
      )}
      {mode === 'surface' && (
        <ThreeDSurface colorRange={palette.sequential.blue(5)} opacity={1} />
      )}
      {mode === 'webgl' && (
        <ThreeDScatterGL color={colors[1]} size={14} opacity={1} />
      )}
    </ThreeDChart>
  );
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <Button label="3D bars" onClick={() => setMode('bars')} />
        <Button label="3D scatter" onClick={() => setMode('scatter')} />
        <Button label="3D surface" onClick={() => setMode('surface')} />
        <Button label="3D WebGL" onClick={() => setMode('webgl')} />
      </div>
      {mode === 'webgl' ? <WebGLGuard>{plot}</WebGLGuard> : plot}
      <p className="demo-copy">
        Axes: x = column, z = row, y = height. Display domains: x and z
        −0.25–2.25; y 0–8. All nine values are unchanged.
      </p>
      <p className="demo-copy" role="status">
        {mode} · Drag the plot, or focus it and press arrow keys to rotate.
        Auto-rotation is off.
      </p>
      <details>
        <summary>View the height grid</summary>
        <p className="demo-copy">
          Columns x = 0, 1, 2. Rows z = 0: 2, 4, 3; z = 1: 4, 8, 6; z = 2: 3, 5,
          4. Values show the height at each position.
        </p>
      </details>
    </div>
  );
}

function VegaPreview() {
  const palette = useChartColors();
  const colors = palette.categorical(1);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="demo-stack">
      <VegaChart
        spec={{
          $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
          description:
            'Weekly completed work: Mon 24, Tue 38, Wed 31, Thu 48, Fri 42.',
          width: 'container',
          height: 210,
          background: 'transparent',
          config: {
            view: {stroke: null},
            axis: {
              labelColor: palette.structural.label,
              titleColor: palette.structural.label,
              domainColor: palette.structural.axis,
              tickColor: palette.structural.tick,
              gridColor: palette.structural.grid,
              labelFontSize: 12,
              labelAngle: 0,
            },
          },
          data: {values: weekly},
          mark: {type: 'bar', color: colors[0], tooltip: true},
          encoding: {
            x: {field: 'day', type: 'ordinal', sort: null, title: 'Day'},
            y: {field: 'value', type: 'quantitative', title: 'Completed work'},
          },
        }}
        viewOptions={{renderer: 'svg'}}
        onError={err => setError(err.message)}
        onReady={() => setError(null)}
      />
      {error && (
        <p className="demo-copy" role="alert">
          The chart couldn’t load: {error}
        </p>
      )}
      <p className="demo-copy">
        Completed: Mon 24, Tue 38, Wed 31, Thu 48, Fri 42.
      </p>
    </div>
  );
}

const material =
  'Data marks remain sharp on a readable chart surface; no blur is applied to chart data.';
export const chartDemos: Demo[] = [
  {
    id: 'chart',
    name: 'Chart composition',
    category: 'Data visualization',
    covers: [
      'Chart',
      'ChartAxis',
      'ChartGrid',
      'ChartLegend',
      'ChartSwatch',
      'ChartTooltip',
    ],
    description:
      'Config-model bars and plan line with shared axes, grid, legend, swatch and pointer tooltip.',
    material,
    code: `const series = [bar('value', {label: 'Completed'}), line('trend', {label: 'Plan'})];
<Chart data={weekly} xKey="day" series={series} grid={<ChartGrid />} axes={<><ChartAxis position="bottom" /><ChartAxis position="left" /></>}>
  <ChartTooltip series={series} />
</Chart>
<ChartLegend items={items} />
<ChartSwatch color={color} variant="square" />`,
    Preview: ConfigChartPreview,
  },
  {
    id: 'chart-area',
    name: '2D chart marks',
    category: 'Data visualization',
    covers: [
      'ChartArea',
      'ChartBar',
      'ChartCandlestick',
      'ChartDot',
      'ChartLine',
    ],
    description:
      'A real range band, bars, plan line and dots; switch to OHLC candlesticks.',
    material,
    code: `<LabChart data={weekly} xKey="day" yKeys={['value', 'trend', 'lower', 'upper']}>
  <ChartArea yUpper="upper" yLower="lower" color={colors[0]} />
  <ChartBar dataKey="value" color={colors[0]} />
  <ChartLine dataKey="trend" color={colors[1]} />
  <ChartDot dataKey="value" color={colors[2]} />
</LabChart>
// Alternate: <ChartCandlestick high="upper" low="lower" open="open" close="close" />`,
    Preview: LabMarksPreview,
  },
  {
    id: 'chart-dot-gl',
    name: 'WebGL scatter & picking',
    category: 'Data visualization',
    heavy: true,
    covers: ['ChartDotGL', 'ChartDotGLInteractive'],
    description:
      'GPU scatter and GPU color-picking on the same nine fixed points.',
    material,
    code: `<LabChart data={samples} xKey="x" yKeys={['value']} xDomain={[-0.5, 8.5]}>
  {picking ? <ChartDotGLInteractive dataKey="value" color={color} size={14} />
    : <ChartDotGL dataKey="value" color={color} size={14} />}
</LabChart>`,
    Preview: GLDotsPreview,
  },
  {
    id: 'chart-heatmap-gl',
    name: 'WebGL heatmap',
    category: 'Data visualization',
    heavy: true,
    covers: ['ChartHeatmapGL'],
    description:
      'Compare activity across three teams and four days.',
    material,
    code: `<LabChart data={heatCells} xKey="day" yKeys={['value']}>
  <ChartHeatmapGL xKey="day" yKey="row" valueKey="value" colorRange={palette.sequential.blue(5)} domain={[0, 10]} />
</LabChart>`,
    Preview: HeatmapPreview,
  },
  {
    id: 'chart-stream-gl',
    name: 'WebGL ring buffer',
    category: 'Data visualization',
    heavy: true,
    covers: ['ChartStreamGL'],
    description:
      'Replay the activity timeline to see how values change.',
    material,
    code: `<ChartStreamGL handleRef={handle} color={color} bufferSize={32} />
// After mount:
handle.current.clear();
samples.forEach(d => handle.current.push(d.x, d.value));`,
    Preview: StreamPreview,
  },
  {
    id: 'radial-chart',
    name: 'Radial chart',
    category: 'Data visualization',
    covers: ['RadialChart'],
    description:
      'A real radial container with native slice marks, percentage labels and a pie/donut switch.',
    material,
    code: `<RadialChart data={slices} valueKey="value" labelKey="label" innerRadius={donut ? 0.6 : 0}>
  <RadialSlice colors={colors} labels />
</RadialChart>`,
    Preview: RadialPreview,
  },
  {
    id: 'sankey-chart',
    name: 'Sankey flow',
    category: 'Data visualization',
    covers: ['SankeyChart'],
    description:
      'Follow ideas and requests from intake to Build and Review.',
    material,
    code: `<SankeyChart nodes={nodes} links={links} height={285}>
  <SankeyLink /><SankeyNode /><SankeyLabel />
</SankeyChart>`,
    Preview: SankeyPreview,
  },
  {
    id: 'three-d-chart',
    name: '3D chart family',
    category: 'Data visualization',
    heavy: true,
    covers: [
      'ThreeDChart',
      'ThreeDBar',
      'ThreeDScatter',
      'ThreeDScatterGL',
      'ThreeDSurface',
    ],
    description:
      'Switch native 3D bars, SVG scatter, surface and WebGL scatter; rotate with pointer or keyboard.',
    material,
    code: `<ThreeDChart data={spatial} xKey="x" yKey="y" zKey="z"
  height={narrow ? 260 : 460} azimuth={30} elevation={30}
  xDomain={[-0.25, 2.25]} yDomain={[0, 8]} zDomain={[-0.25, 2.25]}
  interactive autoRotate={0}>
  <ThreeDAxis labels={false} />
  {mode === 'bars' && <ThreeDBar color={color} />}
  {mode === 'scatter' && <ThreeDScatter color={color} />}
  {mode === 'surface' && <ThreeDSurface colorRange={ramp} />}
  {mode === 'webgl' && <ThreeDScatterGL color={color} />}
</ThreeDChart>
// Keep axis meanings and display domains in a caption outside the rotating plot.`,
    Preview: ThreeDPreview,
  },
  {
    id: 'vega-chart',
    name: 'Vega chart',
    category: 'Data visualization',
    heavy: true,
    covers: ['VegaChart'],
    description:
      'Compare completed work across the week.',
    material,
    code: `<VegaChart spec={{$schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  data: {values: weekly}, mark: 'bar',
  encoding: {x: {field: 'day', type: 'ordinal'}, y: {field: 'value', type: 'quantitative'}}
}} viewOptions={{renderer: 'svg'}} onError={reportError} />`,
    Preview: VegaPreview,
  },
];
