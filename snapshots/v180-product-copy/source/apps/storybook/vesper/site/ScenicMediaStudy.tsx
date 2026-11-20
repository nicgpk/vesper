/* SPDX-License-Identifier: MIT */
import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {Overlay} from '@astryxdesign/core/Overlay';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {MediaTheme} from '@astryxdesign/core/theme';
import './scenic-media-study.css';

export const scenicFrames = [
  {asset: 'nature-ocean', caption: 'Coastal light', alt: 'Golden coastal cliffs above blue water and foaming waves', title: 'Coast'},
  {asset: 'dunes-ridge', caption: 'Dune ridge', alt: 'Wind-rippled dunes under a low sun', title: 'Dunes'},
  {asset: 'nature-forest', caption: 'Forest light', alt: 'Sunbeams through tall trees above green ferns', title: 'Forest'},
  {asset: 'nature-basalt', caption: 'Basalt coast', alt: 'Dark volcanic rock along a monochrome shore', title: 'Basalt'},
  {asset: 'nature-alpine', caption: 'Alpine peaks', alt: 'Mountain peaks and a lake in an alpine valley', title: 'Alpine'},
  {asset: 'nature-salt-flats', caption: 'Salt flats', alt: 'Pale salt flats stretching across a quiet basin', title: 'Salt flats'},
] as const;

function imageSource(asset: string, size?: number) {
  return './assets/' + asset + (size ? '-' + size : '') + '.webp';
}

const scenery = scenicFrames.map(({asset, alt, caption}) => ({
  src: imageSource(asset), alt, caption,
}));

export function MediaPreview() {
  const [viewer, setViewer] = useState({open: false, session: 0});
  const setOpen = (open: boolean) => setViewer(current => {
    if (current.open === open) return current;
    return {open, session: current.session + (open ? 1 : 0)};
  });
  const [index, setIndex] = useState(0);
  const [unavailableFrame, setUnavailableFrame] = useState<number | null>(null);
  const selected = scenicFrames[index];
  return (
    <section className="sm-study" aria-label="Scenery gallery">
      <Overlay className="sm-frame" position="bottom" align="start" content={
        <MediaTheme mode="dark">
          <div className="sm-overlay">
            <div className="sm-caption">
              <strong>{selected.caption}</strong>
              <span role="status">{index + 1} of {scenery.length}</span>
            </div>
            <Button label="Open scenery" onClick={() => setOpen(true)} />
          </div>
        </MediaTheme>
      }>
        <div className="sm-image">
          {unavailableFrame === index
            ? <span className="sm-unavailable" role="status">Preview unavailable</span>
            : <img key={selected.asset} src={imageSource(selected.asset, 384)}
                srcSet={imageSource(selected.asset, 384) + ' 384w, ' + imageSource(selected.asset, 768) + ' 768w'}
                sizes="(max-width: 640px) calc(100vw - 92px), 586px"
                alt={selected.alt} width="768" height="512" loading="lazy" decoding="async"
                onError={() => setUnavailableFrame(index)} />}
        </div>
      </Overlay>
      <div className="sm-contact" role="group" aria-label="Open a scenic frame">
        {scenicFrames.map((scene, position) => (
          <div className="sm-contact-item" key={scene.asset}
            data-current={index === position ? '' : undefined}>
            <div className="sm-thumbnail">
              <Thumbnail className="sm-thumb-control" src={imageSource(scene.asset, 112)} label={scene.title}
                aria-current={index === position ? true : undefined}
                onClick={() => {setIndex(position); setOpen(true);}} />
              {index === position && <span className="sm-current" aria-hidden="true"><Icon icon="check" size="xsm" /></span>}
            </div>
            <span className="sm-name" aria-hidden="true">{scene.title}</span>
          </div>
        ))}
      </div>
      {/* Mount on first open only; retain the native dialog after close for focus restoration. */}
      {viewer.session > 0 && <Lightbox key={viewer.session} className="sm-lightbox"
        isOpen={viewer.open} onOpenChange={setOpen} hasZoom
        media={scenery} index={index} onIndexChange={setIndex} />}
    </section>
  );
}
