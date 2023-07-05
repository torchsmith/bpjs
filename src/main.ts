import './style.scss';

const appEl = document.getElementById('app');

const canvasEl = document.createElement('canvas');
canvasEl.id = 'canvas';

appEl?.appendChild(canvasEl);

import BPJS from './bpjs';

const bpjs = new BPJS(false);

bpjs.start();

postMessage({ payload: 'removeLoading' }, '*');
