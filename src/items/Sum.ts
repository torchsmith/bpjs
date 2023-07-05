import type { Item } from './items';

export const Sum: Item = {
	name: 'Sum',
	description: 'Sum of two numbers (a, b)',
	inputs: [
		{
			name: 'a',
			type: 'number',
		},
		{
			name: 'b',
			type: 'number',
		},
	],
	outputs: [
		{
			name: 'sum',
			type: 'number',
		},
	],
	run: (a: number, b: number) => {
		return a + b;
	},
};
