import type { Item } from './items';

export const Time: Item = {
	name: 'Time',
	description: 'Get Date.now()',
	inputs: [],
	outputs: [
		{
			name: 'Date.now()',
			type: 'number',
		},
	],
	run: () => {
		return { 'Date.now()': Date.now() };
	},
};
