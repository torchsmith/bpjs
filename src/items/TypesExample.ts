import type { Item } from './items';

export const TypesExample: Item = {
	name: 'Types Example',
	description: 'Ex. of different typed inputs',
	inputs: [
		{
			name: 'Number',
			type: 'number',
		},
		{
			name: 'String',
			type: 'string',
		},
		{
			name: 'Boolean',
			type: 'boolean',
		},
		{
			name: 'Any',
			type: 'any',
		},
	],
	outputs: [
		{
			name: 'I return a string',
			type: 'string',
		},
	],
	run: (number: number, string: string, boolean: boolean, any: any) => {
		return { 'I return a string': 'I return a string' };
	},
};
