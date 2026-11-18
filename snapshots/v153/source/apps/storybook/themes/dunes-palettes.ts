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
const neutralPalettes={
 sand:{light:vesperLightTheme,dark:vesperDarkTheme,contrast:vesperContrastTheme},
 ocean:{light:variant('nature-ocean-light',vesperLightTheme,['#E8EFF2','#E8EFF2','#F5F9FB','#F5F9FB','#1D303A','#4C626E']),dark:variant('nature-ocean-dark',vesperDarkTheme,['#152128','#1B2B34','#263944','#304550','#EFF6FA','#B9CBD5']),contrast:vesperContrastTheme},
 forest:{light:variant('nature-forest-light',vesperLightTheme,['#EAF0E9','#EAF0E9','#F7FAF4','#F7FAF4','#233429','#53664F']),dark:variant('nature-forest-dark',vesperDarkTheme,['#17221C','#213027','#2B3B30','#35473A','#F0F6ED','#BECEB9']),contrast:vesperContrastTheme},
};

// Complementary accents separate interactive controls from scenic surfaces.
// Dunes: cobalt, Ocean: copper, Forest: orchid.
// Light mode uses dark accent with white labels; dark mode uses luminous
// accent with dark labels. Native indicators share the accent fill token.
export const sceneAccents={
 sand:{light:{fill:'#1457C4',ink:'#1457C4'},dark:{fill:'#75B6FF',ink:'#75B6FF'}},
 ocean:{light:{fill:'#A44305',ink:'#A44305'},dark:{fill:'#FFB15C',ink:'#FFB15C'}},
 forest:{light:{fill:'#A31F70',ink:'#A31F70'},dark:{fill:'#FF9FD8',ink:'#FF9FD8'}},
} as const;
function accented(scene:DunesPalette,mode:'light'|'dark'){
 const {fill,ink}=sceneAccents[scene][mode];
 return defineTheme({name:`nature-${scene}-${mode}-accent`,extends:neutralPalettes[scene][mode],localTokens:{'--vesper-progress-track':mode==='light'?'#D8DEE3':'#35414A','--vesper-notification-success':'#007333','--vesper-notification-error':'#A92230','--vesper-notification-warning':'#725310','--vesper-notification-info':sceneAccents[scene].light.fill,'--vesper-notification-ink':'#FFFFFF'},tokens:{
  '--color-accent':fill,'--color-on-accent':mode==='light'?'#FFFFFF':'#17212B',
  '--color-text-accent':ink,'--color-icon-accent':ink,
  '--color-accent-muted':`${fill}${mode==='light'?'1A':'14'}`,
  '--focus-outline-color':ink,'--shadow-inset-selected':`inset 0 0 0 2px ${ink}`,
  // Semantic hues stay green/red; mode-specific fill/ink pairs also support
  // native components that use semantic colors directly as foreground text.
  ...(mode==='light'?{
   '--color-success':'#007333','--color-on-success':'#FFFFFF',
   '--color-error':'#A92230','--color-on-error':'#FFFFFF',
  }:{
   '--color-success':'#7BCC97','--color-on-success':'#0E301A',
   '--color-error':'#FFC1C4','--color-on-error':'#371015',
  }),
 }});
}
export const dunesPalettes={
 sand:{light:accented('sand','light'),dark:accented('sand','dark'),contrast:vesperContrastTheme},
 ocean:{light:accented('ocean','light'),dark:accented('ocean','dark'),contrast:vesperContrastTheme},
 forest:{light:accented('forest','light'),dark:accented('forest','dark'),contrast:vesperContrastTheme},
};
