import type { Item } from './items';

export const RandomNumber: Item = {
	name: 'Random Number',
	description: 'Get random number 0-10',
	inputs: [],
	outputs: [
		{
			name: 'number',
			type: 'number',
		},
	],
	run: () => {
		return { number: Math.floor(Math.random() * 10) };
	},
};
