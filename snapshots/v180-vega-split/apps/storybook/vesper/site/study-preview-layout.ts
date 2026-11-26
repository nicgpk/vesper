/* SPDX-License-Identifier: MIT — authored study layout, native map unchanged. */
import {getPreviewLayout as nativeLayout} from './preview-layout';
export function getPreviewLayout(id:string){return (id==='image-material'||id==='native-media-viewer'||id==='chat-generative-ui'||id==='chat-approval'||id==='segmented-control')?'wide':nativeLayout(id);}
