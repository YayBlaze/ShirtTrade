import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

export enum ItemType {
	Shirt = 'Shirt',
	Hoodie = 'Hoodie',
	ZipUp = 'Zip-up',
	Hat = 'Hat',
	Plush = 'Plush',
	Polo = 'Polo',
	Misc = 'Misc.'
}

export const ITEM_TYPE_COLORS: Record<ItemType, string> = {
	[ItemType.Shirt]: '#A8D0F0', // soft sky blue
	[ItemType.Polo]: '#A8E0DC', // soft teal

	[ItemType.Hoodie]: '#B9AEE8', // lavender
	[ItemType.ZipUp]: '#DDB8E8', // orchid

	[ItemType.Hat]: '#FFD3A5', // peach
	[ItemType.Plush]: '#FFB8D1', // soft pink

	[ItemType.Misc]: '#D3D3D8' // light gray
};

export enum Size {
	XXS = '≤XXS',
	XS = 'XS',
	S = 'S',
	M = 'M',
	L = 'L',
	XL = 'XL',
	XXL = 'XXL',
	XXXL = '≥3XL',
	NA = 'N/A'
}

export const SIZE_COLORS: Record<Size, string> = {
	[Size.XXS]: '#C4EDE8', // pale aqua
	[Size.XS]: '#A6E3DC', // aqua
	[Size.S]: '#8ED6D6', // soft cyan

	[Size.M]: '#F5E6A3', // soft butter yellow

	[Size.L]: '#FFD9A8', // light apricot
	[Size.XL]: '#FFC4A0', // soft coral
	[Size.XXL]: '#F5ADA6', // salmon pink
	[Size.XXXL]: '#E89EB0', // dusty rose

	[Size.NA]: '#D8D8DC' // light gray
};

export enum Condition {
	Unworn = 'Unworn',
	Undamaged = 'Worn - Undamaged',
	Minor = 'Worn - Minor Damage',
	Major = 'Worn - Major Damage'
}

export const CONDITION_COLORS: Record<Condition, string> = {
	[Condition.Unworn]: '#A8E6B8', // mint green
	[Condition.Undamaged]: '#D2EBA0', // lime
	[Condition.Minor]: '#FFDDA0', // soft amber
	[Condition.Major]: '#F5A8A8' // soft red
};

export type Item = {
	itemID: string;
	ownerID: string;
	teamNumber: number;
	itemType: ItemType;
	tradeability: number;
	size: Size;
	description: string;
	year: string;
	primaryColor: string;
	secondaryColor: string;
	condition: Condition;
	nam: number;
	quantity: number;
};

export type Team = {
	number: number;
	name: string;
	image: string;
	namValue: number;
	active: boolean;
	primaryColor: string;
	secondaryColor: string;
};

export function normalize(text: string): string {
	return text
		.normalize('NFKD') // 1
		.replace(/[\u0300-\u036f]/g, '') // 2
		.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '') // 3
		.replace(/([a-z])([A-Z])/g, '$1 $2') // 4
		.replace(/[_\-.,:;~^=]+/g, ' ') // 5
		.replace(/\s+/g, ' ') // 6
		.trim();
}

export const nsfwMatcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers
});

export const hasProfanity = (text: string) => nsfwMatcher.hasMatch(normalize(text));
