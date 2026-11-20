export function mount(root: HTMLElement, options: {src: string}): () => void;
export class WaveField {constructor(n?:number);h:Float32Array;v:Float32Array;reset():void;disturb(x:number,y:number,force?:number):void;step():number;pixels():Uint8Array;}
