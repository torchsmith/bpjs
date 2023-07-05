import BoxInput from './boxInput';
import Camera from './camera';
import Collider from './collider';
import Input from './input';
import { Item } from './items/items';

type BoxInputs = {
	[key: string]: BoxInput;
};
type BoxOutputs = {
	[key: string]: BoxInput;
};

export default class Box {
	public id = Math.random().toString(36).substr(2, 9);

	public item: Item;
	public inputs: BoxInputs = {};
	public outputs: BoxOutputs = {};

	public collider: Collider;

	public handleCollider: Collider;
	// private handleIsHovered = false;
	private handleIsDragging = false;

	get x() {
		return this.collider.x;
	}

	get y() {
		return this.collider.y;
	}

	get width() {
		return this.collider.width;
	}

	get height() {
		return this.collider.height;
	}

	constructor(item: Item, x?: number, y?: number) {
		this.item = item;

		this.collider = new Collider(x ?? 0, y ?? 0, 200, 150);
		// handle collider is the top bar that you can drag the box with
		this.handleCollider = new Collider(
			this.collider.x,
			this.collider.y - 50,
			this.collider.width,
			58
		);

		this.initInputsAndOutputs();
		this.initEvents();
	}

	public initInputsAndOutputs() {
		const itemInputsCount = Object.keys(this.item.inputs).length;

		const itemOutputsCount = Object.keys(this.item.outputs).length;

		this.inputs = this.item.inputs.reduce<BoxInputs>((acc, input, index) => {
			acc[input.name] = new BoxInput(
				input,
				this,
				-3,
				(this.height / (itemInputsCount + 1)) * (index + 1)
			);
			return acc;
		}, {});
		this.outputs = this.item.outputs.reduce<BoxOutputs>(
			(acc, output, index) => {
				acc[output.name] = new BoxInput(
					output,
					this,
					this.collider.width - 3,
					(this.height / (itemOutputsCount + 1)) * (index + 1),
					'right'
				);
				return acc;
			},
			{}
		);
	}

	public initEvents() {
		Input.onMouseMove.push((x, y, dx, dy) => {
			if (this.handleIsDragging) {
				this.collider.x += dx / Camera.instance.zoom;
				this.collider.y += dy / Camera.instance.zoom;
				this.handleCollider.x += dx / Camera.instance.zoom;
				this.handleCollider.y += dy / Camera.instance.zoom;
			}
		});

		Input.onMouseDown.push([
			0,
			(x, y) => {
				if (this.handleCollider.isCollidingWithScreenPoint(x, y)) {
					Camera.instance.freeze(this.id);
					this.handleIsDragging = true;
				}
			},
		]);

		Input.onMouseUp.push([
			0,
			(x, y) => {
				Camera.instance.unfreeze(this.id);
				this.handleIsDragging = false;
			},
		]);
	}

	public render(ctx: CanvasRenderingContext2D) {
		// RENDER FONTS/TEXT
		ctx.fillStyle = '#ffffff';

		ctx.font = 20 * Camera.instance.zoom + 'px Arial';

		const wrappedName = wrapText(
			ctx,
			this.item.name,
			Camera.instance.getRenderX(this.x + 12),
			Camera.instance.getRenderY(this.y - 30),
			Camera.instance.getRenderWidth(this.width - 12),
			20 * Camera.instance.zoom
		);

		wrappedName.forEach((line) => {
			ctx.fillText(line[0], line[1], line[2]);
		});

		if (this.item.description) {
			ctx.font = 14 * Camera.instance.zoom + 'px Arial';

			const wrappedDescription = wrapText(
				ctx,
				this.item.description,
				Camera.instance.getRenderX(this.x + 12),
				Camera.instance.getRenderY(this.y - 12),
				Camera.instance.getRenderWidth(this.width - 12),
				20 * Camera.instance.zoom
			);
			wrappedDescription.forEach((line) => {
				ctx.fillText(line[0], line[1], line[2]);
			});
		}

		// RENDER BOXES
		ctx.strokeStyle = '#ffffff';

		// Commented out - render the drag rectangle
		// ctx.fillStyle = '#f00';

		// ctx.fillRect(
		// 	Camera.instance.getRenderX(this.handleCollider.x),
		// 	Camera.instance.getRenderY(this.handleCollider.y),
		// 	Camera.instance.getRenderWidth(this.handleCollider.width),
		// 	Camera.instance.getRenderHeight(this.handleCollider.height)
		// );

		ctx.fillStyle = '#222222';
		ctx.beginPath();
		ctx.roundRect(
			Camera.instance.getRenderX(this.x),
			Camera.instance.getRenderY(this.y),
			Camera.instance.getRenderWidth(this.width),
			Camera.instance.getRenderHeight(this.height),
			12 * Camera.instance.zoom
		);
		ctx.fill();
		ctx.stroke();

		ctx.save();

		Object.keys(this.inputs).forEach((inputName, index) => {
			this.inputs[inputName].render(ctx);
		});
		Object.keys(this.outputs).forEach((outputName, index) => {
			this.outputs[outputName].render(ctx);
		});
		ctx.restore();
	}

	public update(dt: number) {}
}

function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number
) {
	// First, start by splitting all of our text into words, but splitting it into an array split by spaces
	let words = text.split(' ');
	let line = ''; // This will store the text of the current line
	let testLine = ''; // This will store the text when we add a word, to test if it's too long
	let lineArray: [string, number, number][] = []; // This is an array of lines, which the function will return

	// Lets iterate over each word
	for (var n = 0; n < words.length; n++) {
		// Create a test line, and measure it..
		testLine += `${words[n]} `;
		let metrics = ctx.measureText(testLine);
		let testWidth = metrics.width;
		// If the width of this test line is more than the max width
		if (testWidth > maxWidth && n > 0) {
			// Then the line is finished, push the current line into "lineArray"
			lineArray.push([line, x, y]);
			// Increase the line height, so a new line is started
			y += lineHeight;
			// Update line and test line to use this word as the first word on the next line
			line = `${words[n]} `;
			testLine = `${words[n]} `;
		} else {
			// If the test line is still less than the max width, then add the word to the current line
			line += `${words[n]} `;
		}
		// If we never reach the full max width, then there is only one line.. so push it into the lineArray so we return something
		if (n === words.length - 1) {
			lineArray.push([line, x, y]);
		}
	}
	// Return the line array
	return lineArray;
}
