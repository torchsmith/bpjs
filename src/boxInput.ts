import Box from './box';
import BPJS from './bpjs';
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

	public id = Math.random().toString(36).substring(2, 9);
	public connectedBox: Box | null = null;
	public box: Box;

	public input: ItemInput;

	private type: 'input' | 'output';
	private align: 'left' | 'right';

	private collider: Collider;

	private color: string;
	private isHovered = false;
	private isDragging = false;

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
		type: 'input' | 'output' = 'input'
	) {
		this.input = input;

		this.collider = new Collider(x, y, BoxInput.WIDTH, BoxInput.WIDTH);
		this.box = box;
		this.x = x;
		this.y = y;

		this.xOffset = x;
		this.yOffset = y;

		this.type = type;
		this.align = type === 'input' ? 'left' : 'right';

		this.color = BoxInput.getBoxInputColor(this.input.type);

		this.initEvents();
	}

	public initEvents() {
		Input.onMouseMove.push((x, y) => {
			this.isHovered = this.collider.isCollidingWithScreenPoint(x, y);
		});

		Input.onMouseDown.push([
			0,
			() => {
				if (this.isHovered) {
					this.isDragging = true;
					Camera.instance.freeze(this.id);
				}
			},
		]);

		Input.onMouseUp.push([
			0,
			() => {
				this.isDragging = false;
				Camera.instance.unfreeze(this.id);
			},
		]);
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

		ctx.strokeStyle = '#fff';
		if (this.isDragging) {
			const mouseWorldPos = BPJS.instance.getWorldPointAtScreenPoint(
				Input.mouse.x,
				Input.mouse.y
			);

			const distanceX = Math.abs(this.x - mouseWorldPos[0]);
			const halfDistanceX =
				(this.type === 'input' ? distanceX : -distanceX) / 2;

			const xOffset = this.type === 'input' ? 0 : this.width;

			ctx.beginPath();
			ctx.moveTo(
				Camera.instance.getRenderX(this.x + xOffset),
				Camera.instance.getRenderY(this.y + this.height / 2)
			);

			ctx.bezierCurveTo(
				Camera.instance.getRenderX(this.x - halfDistanceX),
				Camera.instance.getRenderY(this.y + this.height / 2),
				Camera.instance.getRenderX(mouseWorldPos[0] + halfDistanceX),
				Camera.instance.getRenderY(mouseWorldPos[1]),
				Camera.instance.getRenderX(mouseWorldPos[0]),
				Camera.instance.getRenderY(mouseWorldPos[1])
			);
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
