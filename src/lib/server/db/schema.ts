import { boolean, pgEnum, pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
export * from './auth.schema';

export const item_type = pgEnum('item_type', [
	'Shirt',
	'Hoodie',
	'Zip-up',
	'Hat',
	'Plush',
	'Polo',
	'Misc.'
]);

export const size = pgEnum('size', ['≤XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '≥3XL', 'N/A']);

export const condition = pgEnum('condition', [
	'Unworn',
	'Worn - Undamaged',
	'Worn - Minor Damage',
	'Worn - Major Damage'
]);

export const inventory = pgTable('user_profile', {
	itemID: uuid('uuid').primaryKey().notNull(),
	ownerID: text('user-id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	teamNumber: smallint('team_number').notNull(),
	itemType: item_type().notNull(),
	tradeability: smallint().notNull().default(5),
	size: size().notNull(),
	description: text(),
	year: text(),
	primaryColor: text('primary_color').notNull(),
	secondaryColor: text('secondary_color'),
	condition: condition().notNull(),
	nam: smallint(),
	quantity: smallint()
});

export const teams = pgTable('teams', {
	number: smallint('team_number').primaryKey().notNull(),
	name: text('team_name').notNull(),
	image: text('image'),
	namValue: smallint('nam_value').notNull(),
	active: boolean('active').notNull().default(true),
	primaryColor: text('primary_color'),
	secondaryColor: text('secondary_color')
});
