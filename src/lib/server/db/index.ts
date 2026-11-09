import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { eq } from 'drizzle-orm';
import type { Item, Team } from '$lib';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

export async function isValidUser(id: string) {
	const user = await db.select().from(schema.user).where(eq(schema.user.id, id));
	return user.length > 0;
}

export async function getActiveTeamNumbers(): Promise<number[]> {
	const rows = await db
		.select({ number: schema.teams.number })
		.from(schema.teams)
		.where(eq(schema.teams.active, true))
		.orderBy(schema.teams.number);
	return rows.map((row) => row.number);
}

export async function getAllTeams(): Promise<Team[]> {
	return (await db.select().from(schema.teams).orderBy(schema.teams.number)) as Team[];
}

export async function getAllItems(): Promise<Item[]> {
	return (await db.select().from(schema.inventory)) as Item[];
}

export async function getItemsFromPerson(ownerID: string): Promise<Item[]> {
	return (await db
		.select()
		.from(schema.inventory)
		.where(eq(schema.inventory.ownerID, ownerID))) as Item[];
}

export async function newItem(data: Item) {
	data.itemID = crypto.randomUUID();
	await db.insert(schema.inventory).values(data);
}
