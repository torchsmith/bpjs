import Camera from './camera';
import Collider from './collider';
import { Item } from './items/items';

export default class Box {
	public item: Item;
	public inputs: { [key: string]: Box | null } = {};

	public collider: Collider;

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

	constructor(item: Item) {
		this.item = item;

		this.inputs = item.inputs.reduce((acc, input) => {
			acc[input.name] = null;
			return acc;
		}, {} as { [key: string]: Box | null });

		this.collider = new Collider(0, 0, 200, 150);
	}

	public render(ctx: CanvasRenderingContext2D) {
		ctx.strokeStyle = 'red';

		ctx.beginPath();
		ctx.roundRect(
			Camera.instance.getRenderX(this.x),
			Camera.instance.getRenderY(this.y),
			Camera.instance.getRenderWidth(this.width),
			Camera.instance.getRenderHeight(this.height),
			12 * Camera.instance.zoom
		);
		ctx.stroke();

		ctx.save();

		// TODO: move these position calculations to init/constructor so it doesn't have to be calculated every frame
		// TODO: convert the inputs into a new class "BoxInput", that has it's own collider and render function.
		// This will allow for easier collision detection, hover states, etc.
		let offset = 0;

		// make all inputs centered as a group vertically with 10
		if (Object.keys(this.inputs).length % 2 === 0) {
			offset = 0.5;
		}

		Object.keys(this.inputs).forEach((inputName, index) => {
			const input = this.inputs[inputName];

			ctx.beginPath();
			ctx.ellipse(
				Camera.instance.getRenderX(this.x - 3),
				Camera.instance.getRenderY(
					(this.height / (Object.keys(this.inputs).length + 1)) * (index + 1)
				),
				Camera.instance.getRenderWidth(10),
				Camera.instance.getRenderHeight(10),
				0,
				0,
				2 * Math.PI
			);

			if (input) {
				ctx.fillStyle = '#fff';
				ctx.fill();
			} else {
				ctx.fillStyle = '#242424';
				ctx.lineWidth = 1.5 * Camera.instance.zoom;
				ctx.fill();
				ctx.stroke();
			}
		});
		ctx.restore();

		ctx.fillStyle = 'red';

		ctx.font = 20 * Camera.instance.zoom + 'px Arial';

		const wrappedName = wrapText(
			ctx,
			this.item.name,
			Camera.instance.getRenderX(this.x + 12),
			Camera.instance.getRenderY(this.y + 22),
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
				Camera.instance.getRenderY(this.y + 40),
				Camera.instance.getRenderWidth(this.width - 12),
				20 * Camera.instance.zoom
			);
			wrappedDescription.forEach((line) => {
				ctx.fillText(line[0], line[1], line[2]);
			});
		}
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
