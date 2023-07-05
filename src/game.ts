import Stats from 'stats.js';
import Input from './input';
import Camera from './camera';
import UI from './ui';
import Box from './box';

import * as importedItems from './items/index';
import type { Item } from './items/items';

export default class Game {
	/**
	 * Singleton instance.
	 */
	public static instance: Game;

	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;

	/**
	 * Camera.
	 */
	public camera: Camera;

	private items: Item[] = [];
	private boxes: Box[] = [];

	/**
	 * Game loop.
	 */
	private lastUpdate = 0;

	public stats: Stats | undefined;

	constructor(stats: boolean = false) {
		if (Game.instance) throw new Error('Game already exists!');

		Game.instance = this;

		if (stats) {
			this.stats = new Stats();
			this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
			this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
			this.stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
			document.body.appendChild(this.stats.dom);
		}

		this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

		this.resize();

		window.addEventListener('resize', this.resize.bind(this));

		// Init Input (always first)
		new Input();

		// Init UI
		new UI();

		// Init Camera (always last)
		this.camera = new Camera();
	}

	public getWorldPointAtScreenPoint(
		x: number,
		y: number
	): [x: number, y: number] {
		const worldX = (x + this.camera.getX()) / this.camera.zoom; // Times zoom because camera is centered
		const worldY = (y + this.camera.getY()) / this.camera.zoom; // Times zoom because camera is centered

		return [worldX, worldY];
	}

	/**
	 * Initialize the game.
	 */
	private init(): void {
		this.addItem(importedItems.Sum);
		this.addItem(importedItems.TypesExample);

		this.addBox(new Box(importedItems.Sum));
		this.addBox(new Box(importedItems.TypesExample, 250, 0));

		console.log(this.items);
	}

	/**
	 * Render the game. This contains all the rendering logic.
	 */
	private render(): void {
		this.stats?.begin();

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (let i = 0; i < this.boxes.length; i++) {
			this.boxes[i].render(this.ctx);
		}

		this.stats?.end();

		// Render next frame
		requestAnimationFrame(() => {
			const now = Date.now();
			const deltaTime = now - this.lastUpdate;

			this.lastUpdate = now;

			this.update(deltaTime / 1000);
			this.render();
		});
	}

	/**
	 * Add item to the world
	 */
	public addItem(item: Item): void {
		this.items.push(item);
	}

	public addBox(box: Box): void {
		this.boxes.push(box);
	}

	/**
	 * Delete item from the world
	 */
	public deleteItem(item: Item): void {
		const index = this.items.indexOf(item);

		if (index > -1) {
			this.items.splice(index, 1);
		}
	}

	public deleteBox(box: Box): void {
		const index = this.boxes.indexOf(box);

		if (index > -1) {
			this.boxes.splice(index, 1);
		}
	}

	/**
	 * Update the game. This contains all the game logic.
	 */
	private update(deltaTime: number): void {
		// update logic here
	}

	/**
	 * Start the game. This will initialize the game and start the update and render loops.
	 * This should only be called once.
	 * If you want to stop the game, call the stop method.
	 * @see stop
	 * @see init
	 * @see update
	 * @see render
	 */
	public start(): void {
		this.init();

		this.lastUpdate = Date.now();
		this.update(0);

		this.render();
	}

	/**
	 * Stop the game. This will stop the update and render loops and remove the canvas from the DOM.
	 * This should only be called once.
	 * If you want to start the game, call the start method.
	 * @see start
	 */
	public stop(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		cancelAnimationFrame(0);

		this.canvas.remove();

		Game.instance = undefined as any;

		console.log('Game stopped');
	}

	/**
	 * Resize the canvas to the window size.
	 * This should be called when the window is resized.
	 */
	public resize(): void {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		// Keep things pixelated when resizing
		this.ctx.imageSmoothingEnabled = false;
	}
}
