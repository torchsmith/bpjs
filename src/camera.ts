import BPJS from './bpjs';
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
	}

	private minZoom = 1;
	private maxZoom = 3;

	/**
	 * If true, the camera will not move with drag events
	 */
	private frozenBy: string[] = [];

	public freeze(id: string) {
		this.frozenBy.push(id);
	}

	public unfreeze(id: string) {
		this.frozenBy = this.frozenBy.filter((frozenId) => frozenId !== id);
	}

	public static instance: Camera;

	constructor() {
		if (Camera.instance) throw new Error('Camera already exists!');

		Camera.instance = this;

		this._zoom = 0;
		this.zoom = 1;

		Input.onMouseMove.push((_x, _y, movementX, movementY) => {
			if (!this.frozenBy.length && Input.mouseDown[0]) {
				this.x -= movementX;
				this.y -= movementY;
			}
		});

		document.addEventListener('wheel', (e) => {
			const canvas = BPJS.instance.canvas;

			const xModifier = (e.clientX / canvas.width) * 10;
			const yModifier = (e.clientY / canvas.height) * 10;

			if (e.deltaY > 0 && this.zoom > this.minZoom) {
				this.zoom -= 0.25;

				this.x -= xModifier * 20;
				this.y -= yModifier * 20;
			} else if (e.deltaY < 0 && this.zoom < this.maxZoom) {
				this.zoom += 0.25;

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
