import './style.scss';

const appEl = document.getElementById('app');

const canvasEl = document.createElement('canvas');
canvasEl.id = 'canvas';

appEl?.appendChild(canvasEl);

import Game from './game';

const game = new Game(false);

game.start();

postMessage({ payload: 'removeLoading' }, '*');
