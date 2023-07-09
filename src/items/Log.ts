import type { Item } from './items';

export const Log: Item = {
	name: 'Log',
	description: 'Console log value',
	inputs: [
		{
			name: 'value',
			type: 'any',
		},
	],
	outputs: [],
	run: (value: any) => {
		console.log('Logging a value from a custom node', value);
		return null;
	},
};
