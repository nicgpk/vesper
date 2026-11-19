// Dunes is the default. Scenic variants share the library glass and semantic tokens.
import {defineTheme} from '@astryxdesign/core/theme';
import {vesperLightTheme,vesperDarkTheme,vesperContrastTheme} from './vesper';
export const paletteNames=['sand','ocean','forest','alpine','basalt','salt-flats'] as const;
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
 alpine:{light:variant('nature-alpine-light',vesperLightTheme,['#E9EDF7','#E9EDF7','#F6F7FF','#F6F7FF','#202947','#4D5977']),dark:variant('nature-alpine-dark',vesperDarkTheme,['#181E30','#202A42','#2A3654','#334263','#F3F5FF','#C3CCEB']),contrast:vesperContrastTheme},
 basalt:{light:variant('nature-basalt-light',vesperLightTheme,['#EDEDED','#EDEDED','#FAFAFA','#FAFAFA','#252525','#535353']),dark:variant('nature-basalt-dark',vesperDarkTheme,['#191919','#232323','#2D2D2D','#373737','#F5F5F5','#C7C7C7']),contrast:vesperContrastTheme},
 'salt-flats':{light:variant('nature-salt-flats-light',vesperLightTheme,['#F5EAEE','#F5EAEE','#FFF6FA','#FFF6FA','#402437','#694B60']),dark:variant('nature-salt-flats-dark',vesperDarkTheme,['#2B1C2A','#352234','#432E43','#543751','#FFF3FA','#E5C9DD']),contrast:vesperContrastTheme},
};

// Complementary accents separate interactive controls from scenic surfaces.
// Dunes: cobalt, Ocean: copper, Forest: orchid.
// Light mode uses dark accent with white labels; dark mode uses luminous
// accent with dark labels. Native indicators share the accent fill token.
export const sceneAccents={
 sand:{light:{fill:'#1457C4',ink:'#1457C4'},dark:{fill:'#75B6FF',ink:'#75B6FF'}},
 ocean:{light:{fill:'#A44305',ink:'#A44305'},dark:{fill:'#FFB15C',ink:'#FFB15C'}},
 forest:{light:{fill:'#A31F70',ink:'#A31F70'},dark:{fill:'#FF9FD8',ink:'#FF9FD8'}},
 alpine:{light:{fill:'#6533A4',ink:'#6533A4'},dark:{fill:'#CBB0FF',ink:'#CBB0FF'}},
 basalt:{light:{fill:'#3D3D3D',ink:'#3D3D3D'},dark:{fill:'#D6D6D6',ink:'#D6D6D6'}},
 'salt-flats':{light:{fill:'#00594C',ink:'#00594C'},dark:{fill:'#79E7C7',ink:'#79E7C7'}},
} as const;
export const paletteLabels:Record<DunesPalette,string>={sand:'Dunes',ocean:'Ocean',forest:'Forest',alpine:'Alpine',basalt:'Basalt','salt-flats':'Salt Flats'};
function accented(scene:DunesPalette,mode:'light'|'dark'){
 const {fill,ink}=sceneAccents[scene][mode];
 return defineTheme({name:`nature-${scene}-${mode}-accent`,extends:neutralPalettes[scene][mode],localTokens:{'--vesper-progress-track':scene==='basalt'?(mode==='light'?'#DADADA':'#444444'):(mode==='light'?'#D8DEE3':'#35414A'),'--vesper-notification-success':'#007333','--vesper-notification-error':'#A92230','--vesper-notification-warning':'#725310','--vesper-notification-info':sceneAccents[scene].light.fill,'--vesper-notification-ink':'#FFFFFF'},tokens:{
  '--color-accent':fill,'--color-on-accent':mode==='light'?'#FFFFFF':scene==='basalt'?'#202020':'#17212B',
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
// Keep the contrast system's semantic pairs and larger focus ring. Scene tint
// remains in the canvas and accents; text sits on deliberately denser glass.
const contrastScenes:Record<DunesPalette,{body:string;panel:string;accent:string}>={
 sand:{body:'#15120E',panel:'#211C16',accent:'#B9DDFF'},
 ocean:{body:'#0C161D',panel:'#14222B',accent:'#FFD1A0'},
 forest:{body:'#101912',panel:'#19251C',accent:'#FFC4E8'},
 alpine:{body:'#111426',panel:'#1B2238',accent:'#E1C9FF'},
 basalt:{body:'#131313',panel:'#202020',accent:'#EEEEEE'},
 'salt-flats':{body:'#1D121C',panel:'#2A1B29',accent:'#A6F4D9'},
};
function scenicContrast(scene:DunesPalette){
 const {body,panel,accent}=contrastScenes[scene];
 return defineTheme({
  name:`nature-${scene}-contrast`,extends:vesperContrastTheme,
  tokens:{
   '--color-background-body':body,'--color-background-surface':body,
   '--color-background-card':panel,'--color-background-popover':panel,
   '--color-text-secondary':scene==='basalt'?'#EFEFEF':'#EDF0F3','--color-icon-secondary':scene==='basalt'?'#EFEFEF':'#EDF0F3',
   '--color-accent':accent,'--color-text-accent':accent,'--color-icon-accent':accent,
   '--color-on-accent':body,'--color-accent-muted':`${accent}20`,
   '--color-border':scene==='basalt'?'#BDBDBD':'#B7BEC5','--color-border-emphasized':scene==='basalt'?'#EFEFEF':'#EDF0F3',
   '--focus-outline-color':accent,'--shadow-inset-selected':`inset 0 0 0 2px ${accent}`,
  },
  localTokens:{
   '--vesper-backdrop':body,'--dunes-scrim':`${body}4D`,
   '--vesper-glass-fill':`${panel}DF`,'--vesper-glass-panel':`${panel}E0`,
   '--vesper-glass-rim':'var(--color-border)','--vesper-progress-track':scene==='basalt'?'#525252':'#4C5259',
  },
 });
}
export const dunesPalettes=Object.fromEntries(paletteNames.map(scene=>[
 scene,{light:accented(scene,'light'),dark:accented(scene,'dark'),contrast:scenicContrast(scene)},
])) as Record<DunesPalette,{light:ReturnType<typeof accented>;dark:ReturnType<typeof accented>;contrast:ReturnType<typeof scenicContrast>}>;
