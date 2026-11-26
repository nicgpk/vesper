/* SPDX-License-Identifier: MIT */
import {useId} from 'react';
import {paletteLabels,paletteNames,type DunesPalette} from '../../themes/dunes-palettes';
import './scene-picker.css';

const thumb:Record<DunesPalette,string>={
  sand:'dunes-ridge',ocean:'nature-ocean',forest:'nature-forest',
  alpine:'nature-alpine',basalt:'nature-basalt','salt-flats':'nature-salt-flats',
};

export function ScenePicker({value,onChange}:{value:DunesPalette;onChange:(scene:DunesPalette)=>void}) {
  const group=useId();
  return (
    <fieldset className="scene-picker" aria-label="Nature theme">
      <legend className="exact-sr">Nature theme</legend>
      <span className="scene-picker-title" aria-hidden="true">Scene</span>
      <div className="scene-picker-options">
        {paletteNames.map(scene=>(
          <label className="scene-picker-option" key={scene}>
            <input type="radio" name={group} value={scene} checked={scene===value} onChange={()=>onChange(scene)} />
            <span className="scene-picker-card">
              <img src={`assets/${thumb[scene]}-112.webp`} alt="" width="112" height="75" decoding="async" />
              <span className="scene-picker-name">{paletteLabels[scene]}</span>
              <span className="scene-picker-mark" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
