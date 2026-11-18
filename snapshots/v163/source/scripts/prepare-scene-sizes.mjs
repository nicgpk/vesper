// Delivery derivatives only: retain original content/aspect ratio and originals.
import {createRequire} from 'node:module';import {stat} from 'node:fs/promises';
const sharp=createRequire(import.meta.url)('sharp');
const dir='apps/storybook/vesper/site/assets';
for(const name of ['dunes-ridge','nature-ocean','nature-forest'])for(const width of [384,768]){const dest=`${dir}/${name}-${width}.webp`;await sharp(`${dir}/${name}.webp`).resize({width,withoutEnlargement:true}).webp({quality:85,effort:5}).toFile(dest);console.log(`${name} ${width}: ${(await stat(dest)).size} B`);}
