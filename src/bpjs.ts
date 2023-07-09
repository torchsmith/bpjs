import Stats from 'stats.js';
import Input from './input';
import Camera from './camera';
import UI from './ui';
import Box from './box';

import * as importedItems from './items/index';
import type { Item } from './items/items';
import BoxInput from './boxInput';

export default class BPJS {
	/**
	 * Singleton instance.
	 */
	public static instance: BPJS;

	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;

	/**
	 * Camera.
	 */
	public camera: Camera;

	public items: Item[] = [];
	private boxes: Box[] = [];

	/**
	 * BPJS loop.
	 */
	private lastUpdate = 0;

	public stats: Stats | undefined;

	constructor(stats: boolean = false) {
		if (BPJS.instance) throw new Error('BPJS already exists!');

		BPJS.instance = this;

		if (stats) {
			this.stats = new Stats();
			this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
			this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
			this.stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
			document.body.appendChild(this.stats.dom);
		}

		this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

		this.addItem(importedItems.Sum);
		this.addItem(importedItems.TypesExample);
		this.addItem(importedItems.Time);
		this.addItem(importedItems.RandomNumber);
		this.addItem(importedItems.Log);

		this.resize();

		window.addEventListener('resize', this.resize.bind(this));

		// Init Input (always first)
		new Input();

		Input.onKeyDown.push(['P', this.playJavascript.bind(this)]);

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
	 * Initialize the bpjs.
	 */
	private init(): void {
		// this.addBox(new Box(importedItems.Sum, 100, 250));
		// this.addBox(new Box(importedItems.TypesExample, 350, 250));
		// this.addBox(new Box(importedItems.RandomNumber, 600, 250));
		// this.addBox(new Box(importedItems.RandomNumber, 850, 250));
		// this.addBox(new Box(importedItems.Time, 1100, 250));
		// this.addBox(new Box(importedItems.Log, 1350, 250));
		// this.addBox(new Box(importedItems.Log, 1500, 250));

		console.log(this.items);
	}

	/**
	 * Render the bpjs. This contains all the rendering logic.
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

	public getBoxAtWorldPoint(x: number, y: number): Box | null {
		for (let i = 0; i < this.boxes.length; ++i) {
			if (this.boxes[i].collider.isCollidingWithPoint(x, y)) {
				return this.boxes[i];
			}
		}

		return null;
	}

	public getBoxAtScreenPoint(x: number, y: number): Box | null {
		return this.getBoxAtWorldPoint(...this.getWorldPointAtScreenPoint(x, y));
	}

	public getBoxInputAtScreenPoint(x: number, y: number): BoxInput | null {
		return this.getBoxInputAtWorldPoint(
			...this.getWorldPointAtScreenPoint(x, y)
		);
	}

	public getBoxInputInBoxAtScreenPoint(
		box: Box,
		x: number,
		y: number
	): BoxInput | null {
		return this.getBoxInputInBoxAtWorldPoint(
			box,
			...this.getWorldPointAtScreenPoint(x, y)
		);
	}

	public getBoxInputInBoxAtWorldPoint(
		box: Box,
		x: number,
		y: number
	): BoxInput | null {
		const inputKeys = Object.keys(box.inputs);

		for (let i = 0; i < inputKeys.length; ++i) {
			if (box.inputs[inputKeys[i]].collider.isCollidingWithPoint(x, y)) {
				return box.inputs[inputKeys[i]];
			}
		}

		return null;
	}

	public getBoxInputAtWorldPoint(x: number, y: number): BoxInput | null {
		const box = this.getBoxAtWorldPoint(x, y);

		if (!box) {
			return box;
		}

		const inputKeys = Object.keys(box.inputs);

		for (let i = 0; i < inputKeys.length; ++i) {
			if (box.inputs[inputKeys[i]].collider.isCollidingWithPoint(x, y)) {
				return box.inputs[inputKeys[i]];
			}
		}

		return null;
	}

	public getBoxOutputAtScreenPoint(x: number, y: number): BoxInput | null {
		return this.getBoxOutputAtWorldPoint(
			...this.getWorldPointAtScreenPoint(x, y)
		);
	}

	public getBoxOutputAtWorldPoint(x: number, y: number): BoxInput | null {
		const box = this.getBoxAtWorldPoint(x, y);

		if (!box) {
			return box;
		}

		const outputKeys = Object.keys(box.outputs);

		for (let i = 0; i < outputKeys.length; ++i) {
			if (box.outputs[outputKeys[i]].collider.isCollidingWithPoint(x, y)) {
				return box.outputs[outputKeys[i]];
			}
		}

		return null;
	}

	// TODO: Make ability for not all inputs to be required.
	private getDependencies(box: Box): { boxes: Box[]; required: number } {
		const dependencies: Box[] = [];

		const inputKeys = Object.keys(box.inputs);

		for (let i = 0; i < inputKeys.length; ++i) {
			const input = box.inputs[inputKeys[i]];

			if (input.connectedBox) {
				dependencies.push(input.connectedBox);
			}
		}

		return { boxes: dependencies, required: inputKeys.length };
	}

	public playJavascript() {
		console.log('play javascript');
		// filter out boxes that have no dependencies and are not a dependency of the previous box
		const rootBoxes = this.boxes.filter((box, index, array) => {
			const dependencies = this.getDependencies(box);

			return dependencies.required === dependencies.boxes.length; // || prevBoxDependencies.includes(box);
		});

		// sort boxes based on dependencies.
		// dependencies are defined by the connections between box inputs and outputs.
		// if a box output is connected to a box input, the box output is a dependency of the box input.

		const sortedBoxes = rootBoxes.sort((a, b) => {
			const aDependencies = this.getDependencies(a);
			const bDependencies = this.getDependencies(b);

			if (aDependencies.boxes.includes(b)) {
				return 1;
			}

			if (bDependencies.boxes.includes(a)) {
				return -1;
			}

			return 0;
		});

		// run javascript for each box

		for (let i = 0; i < sortedBoxes.length; ++i) {
			const box = sortedBoxes[i];

			const inputKeys = Object.keys(box.inputs);

			let result: any = null;

			if (inputKeys.length === 0) {
				console.groupCollapsed('Running ' + box.item.name);

				result = box.item.run();

				console.log('Result', result);
				console.groupEnd();

				if (result && typeof result === 'object') {
					Object.keys(result).forEach((key) => {
						box.outputs[key].value = result[key] ?? null;
					});
				}

				continue;
			}

			const inputValues = inputKeys.map(
				(key) => box.inputs[key].connectedBoxInput?.value ?? null
			);

			console.groupCollapsed(
				'Running ' + box.item.name + ' with inputs ' + inputValues.join(', ')
			);
			result = box.item.run(...inputValues);
			console.log('Result', result);
			console.groupEnd();

			if (result && typeof result === 'object') {
				Object.keys(result).forEach((key) => {
					box.outputs[key].value = result[key] ?? null;
				});
			}
		}
	}

	/**
	 * Update the bpjs. This contains all the bpjs logic.
	 */
	private update(deltaTime: number): void {
		// update logic here
	}

	/**
	 * Start the bpjs. This will initialize the bpjs and start the update and render loops.
	 * This should only be called once.
	 * If you want to stop the bpjs, call the stop method.
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
	 * Stop the bpjs. This will stop the update and render loops and remove the canvas from the DOM.
	 * This should only be called once.
	 * If you want to start the bpjs, call the start method.
	 * @see start
	 */
	public stop(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		cancelAnimationFrame(0);

		this.canvas.remove();

		BPJS.instance = undefined as any;

		console.log('BPJS stopped');
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
