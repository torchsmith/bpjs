export type ItemInput = {
	name: string;
	type: string;
};

export type ItemOutput = ItemInput;

export type Item = {
	name: string;
	description?: string;
	inputs: ItemInput[];
	outputs: ItemOutput[];
	run: (...args: any[]) => any;
};
