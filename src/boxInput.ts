import Box from './box';
import Camera from './camera';
import Collider from './collider';
import Input from './input';
import { ItemInput } from './items/items';

export default class BoxInput {
	public static readonly WIDTH = 8;
	public static readonly PI2 = 2 * Math.PI;
	public static readonly TYPE_COLORS: { [key: string]: string } = {
		number: '#ff3333',
		string: '#eeff33',
		boolean: '#33eeff',
		any: '#ff00ff',
	};

	public static getBoxInputColor(type: string) {
		return BoxInput.TYPE_COLORS[type] || '#ffffff';
	}

	public connectedBox: Box | null = null;
	public box: Box;

	public input: ItemInput;

	private collider: Collider;

	private align: 'left' | 'right';
	private color: string;
	private isHovered = false;

	private xOffset: number;
	private yOffset: number;

	get x() {
		return this.collider.x;
	}

	set x(value) {
		this.collider.x = this.box.x + value;
	}

	get y() {
		return this.collider.y;
	}

	set y(value) {
		this.collider.y = this.box.y + value;
	}

	get width() {
		return this.collider.width;
	}

	get height() {
		return this.collider.height;
	}

	constructor(
		input: ItemInput,
		box: Box,
		x: number,
		y: number,
		align: 'left' | 'right' = 'left'
	) {
		this.input = input;

		this.collider = new Collider(x, y, BoxInput.WIDTH, BoxInput.WIDTH);
		this.box = box;
		this.x = x;
		this.y = y;

		this.xOffset = x;
		this.yOffset = y;

		this.align = align;

		this.color = BoxInput.getBoxInputColor(this.input.type);

		this.initEvents();
	}

	public initEvents() {
		Input.onMouseMove.push((x, y) => {
			this.isHovered = this.collider.isCollidingWithScreenPoint(x, y);
		});
	}

	public recalcPosition() {
		this.x = this.xOffset;
		this.y = this.yOffset;
	}
	public recalcXPosition() {
		this.x = this.xOffset;
		this.y = this.yOffset;
	}
	public recalcYPosition() {
		this.x = this.xOffset;
		this.y = this.yOffset;
	}

	public render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.rect(
			Camera.instance.getRenderX(this.x),
			Camera.instance.getRenderY(this.y),
			Camera.instance.getRenderWidth(BoxInput.WIDTH),
			Camera.instance.getRenderHeight(BoxInput.WIDTH)
		);

		ctx.strokeStyle = this.isHovered ? '#fff' : this.color;
		if (this.connectedBox) {
			ctx.fillStyle = this.color;
			ctx.fill();
		} else {
			ctx.fillStyle = '#242424';
			ctx.lineWidth = 1.5 * Camera.instance.zoom;
			ctx.fill();
			ctx.stroke();
		}

		ctx.fillStyle = this.color;
		ctx.textAlign = this.align;
		ctx.fillText(
			this.input.name,
			Camera.instance.getRenderX(
				this.x + BoxInput.WIDTH * (this.align === 'left' ? 2 : -1)
			),
			Camera.instance.getRenderY(this.y + BoxInput.WIDTH)
		);
	}
}
