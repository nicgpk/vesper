// Nature scene palettes: Dunes default, Ocean slate, Forest evergreen.
import {defineTheme} from '@astryxdesign/core/theme';
import {vesperLightTheme,vesperDarkTheme,vesperContrastTheme} from './vesper';
export const paletteNames=['sand','ocean','forest'] as const;
export type DunesPalette=typeof paletteNames[number];
export const validPalette=(value:unknown):DunesPalette=>paletteNames.includes(value as DunesPalette)?value as DunesPalette:'sand';
function variant(name:string,base:typeof vesperDarkTheme,colors:string[]){
 const [body,surface,card,popover,primary,secondary]=colors;
 return defineTheme({name,extends:base,tokens:{
  '--color-background-body':body,'--color-background-surface':surface,
  '--color-background-card':card,'--color-background-popover':popover,
  '--color-text-primary':primary,'--color-text-secondary':secondary,
  '--color-icon-primary':primary,'--color-icon-secondary':secondary,
 },localTokens:{'--vesper-glass-fill':`${card}66`,'--vesper-glass-panel':`${card}CC`,'--vesper-backdrop':body,'--dunes-scrim':`${body}${name.endsWith('light')?'4D':'66'}`}});
}
export const dunesPalettes={
 sand:{light:vesperLightTheme,dark:vesperDarkTheme,contrast:vesperContrastTheme},
 ocean:{light:variant('nature-ocean-light',vesperLightTheme,['#E8EFF2','#E8EFF2','#F5F9FB','#F5F9FB','#1D303A','#4C626E']),dark:variant('nature-ocean-dark',vesperDarkTheme,['#152128','#1B2B34','#263944','#304550','#EFF6FA','#B9CBD5']),contrast:vesperContrastTheme},
 forest:{light:variant('nature-forest-light',vesperLightTheme,['#EAF0E9','#EAF0E9','#F7FAF4','#F7FAF4','#233429','#53664F']),dark:variant('nature-forest-dark',vesperDarkTheme,['#17221C','#213027','#2B3B30','#35473A','#F0F6ED','#BECEB9']),contrast:vesperContrastTheme},
};
