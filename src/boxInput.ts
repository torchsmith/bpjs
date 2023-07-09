import Box from './box';
import BPJS from './bpjs';
import Camera from './camera';
import Collider from './collider';
import Input from './input';
import { ItemInput } from './items/items';

// TODO: instead of using a "type" property to distingiush between input and output actually make a new "BoxOutput" class.
// The new class will behave almost identically so break some different stuff out into some global functions + constants.
// The new class should have the connectedBoxInput property, and handle rendering it's own connectors.
// This BoxInput class will lose the connectedBoxInput property, and rendering for the connected connectors.
// It should still handle rendering connectors when dragging out from an input to another location.
// On mouseUp swap responsibility over to the it was dropped on.
// BoxOutput should be able to handle multiple connectedBoxInputs, not just a single one.
//
// Box inputs do actually need to track what's connected to them. This will make it easier to do the following:
// 1. Disconnect them
// 2. Get the value of the connected box output
// 3. Get the type of the connected box output
// more?

export default class BoxInput {
	public static readonly WIDTH = 8;
	public static readonly HALF_WIDTH = this.WIDTH / 2;
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

	public connectedBoxInput: BoxInput | null = null;
	public input: ItemInput;

	public value: any = null;

	private type: 'input' | 'output';
	private align: 'left' | 'right';

	public collider: Collider;

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
			(x, y) => {
				if (this.isDragging) {
					if (this.type === 'input') {
						this.connectedBox = BPJS.instance.getBoxAtScreenPoint(x, y);

						if (this.connectedBox) {
							const outputBoxInput = BPJS.instance.getBoxOutputAtScreenPoint(
								x,
								y
							);

							if (outputBoxInput) {
								outputBoxInput.connectedBox = this.box;
								outputBoxInput.connectedBoxInput = this;

								this.connectedBoxInput = outputBoxInput;
							} else {
								this.connectedBox = null;
								this.connectedBoxInput = null;
							}
						} else {
							this.connectedBoxInput = null;
						}
					} else {
						this.connectedBox = BPJS.instance.getBoxAtScreenPoint(x, y);

						if (this.connectedBox) {
							this.connectedBoxInput =
								BPJS.instance.getBoxInputInBoxAtScreenPoint(
									this.connectedBox,
									x,
									y
								);

							if (this.connectedBoxInput) {
								this.connectedBoxInput.connectedBox = this.box;
								// TODO: Make sure we handle when someone tries to reconnect to the same thing causing an infinite loop here.
								this.connectedBoxInput.connectedBoxInput = this;
							} else {
								this.connectedBox = null;
								this.connectedBoxInput = null;
							}
						} else {
							this.connectedBoxInput = null;
						}
					}
					this.isDragging = false;
				}
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

		if (this.type === 'output' && this.connectedBoxInput) {
			const distanceX = Math.abs(this.x - this.connectedBoxInput.x);
			const halfDistanceX = -distanceX / 2;

			const xOffset = this.width;

			ctx.beginPath();
			ctx.moveTo(
				Camera.instance.getRenderX(this.x + xOffset),
				Camera.instance.getRenderY(this.y + BoxInput.HALF_WIDTH)
			);

			ctx.bezierCurveTo(
				Camera.instance.getRenderX(this.x - halfDistanceX),
				Camera.instance.getRenderY(this.y + BoxInput.HALF_WIDTH),
				Camera.instance.getRenderX(this.connectedBoxInput.x + halfDistanceX),
				Camera.instance.getRenderY(this.connectedBoxInput.y),
				Camera.instance.getRenderX(this.connectedBoxInput.x),
				Camera.instance.getRenderY(
					this.connectedBoxInput.y + BoxInput.HALF_WIDTH
				)
			);
			ctx.stroke();
		}
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
				Camera.instance.getRenderY(this.y + BoxInput.HALF_WIDTH)
			);

			ctx.bezierCurveTo(
				Camera.instance.getRenderX(this.x - halfDistanceX),
				Camera.instance.getRenderY(this.y + BoxInput.HALF_WIDTH),
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
