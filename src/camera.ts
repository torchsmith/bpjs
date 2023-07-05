import Game from './game';
import Input from './input';

export default class Camera {
	private x = 0;
	private y = 0;

	private _zoom: number;

	get zoom() {
		return this._zoom;
	}

	set zoom(value) {
		this._zoom = value;
		// Game.instance.ctx.font = 20 * Camera.instance.zoom + 'px Arial';
	}

	private minZoom = 1;
	private maxZoom = 3;

	public static instance: Camera;

	constructor() {
		if (Camera.instance) throw new Error('Camera already exists!');

		Camera.instance = this;

		this._zoom = 0;
		this.zoom = 1;

		Input.onMouseMove.push((_x, _y, movementX, movementY) => {
			if (Input.mouseDown[0]) {
				this.x -= movementX / this.zoom;
				this.y -= movementY / this.zoom;
			}
		});

		document.addEventListener('wheel', (e) => {
			const canvas = Game.instance.canvas;
			const cWidth = canvas.width / 2;
			const cHeight = canvas.height / 2;

			// -1 to 1
			const xModifier = (e.clientX - cWidth) / cWidth;
			const yModifier = (e.clientY - cHeight) / cHeight;

			if (e.deltaY > 0 && this.zoom > this.minZoom) {
				this.zoom -= 0.05;

				this.x -= xModifier * 20;
				this.y -= yModifier * 20;
			} else if (e.deltaY < 0 && this.zoom < this.maxZoom) {
				this.zoom += 0.05;

				this.x += xModifier * 20;
				this.y += yModifier * 20;
			}
		});
	}

	public getScreenPointAtWorldPoint(
		x: number,
		y: number
	): [x: number, y: number] {
		const screenX = x * this.zoom - this.x;
		const screenY = y * this.zoom - this.y;

		return [screenX, screenY];
	}

	/**
	 * Returns the render x coordinate based on the camera position and zoom.
	 */
	public getRenderX(x: number): number {
		return x * this.zoom - this.x;
	}

	/**
	 * Returns the render y coordinate based on the camera position and zoom.
	 */
	public getRenderY(y: number): number {
		return y * this.zoom - this.y;
	}

	/**
	 * Returns the render width based on the camera zoom.
	 */
	public getRenderWidth(width: number): number {
		return width * this.zoom;
	}

	/**
	 * Returns the render height based on the camera zoom.
	 */
	public getRenderHeight(height: number): number {
		return height * this.zoom;
	}

	public move(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	public setX(x: number): void {
		this.x = x;
	}

	public setY(y: number): void {
		this.y = y;
	}

	public getX(): number {
		return this.x;
	}

	public getY(): number {
		return this.y;
	}

	public zoomIn(): void {
		this.zoom = Math.min(this.zoom + 0.25, this.maxZoom);
	}

	public zoomOut(): void {
		this.zoom = Math.max(this.zoom - 0.25, this.minZoom);
	}
}
