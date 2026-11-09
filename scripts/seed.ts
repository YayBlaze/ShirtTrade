// DISCLAIMER: This file was written by Claude and reviewed by me

import { sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { teams } from '../src/lib/server/db/schema';

const TBA = 'https://www.thebluealliance.com/api/v3';
const THIS_YEAR = new Date().getFullYear();
const YEARS_BACK = 6; // how many recent seasons count toward the NAM score

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// ---------- helper: call the TBA API ----------
async function tba<T>(path: string): Promise<T> {
	const res = await fetch(TBA + path, {
		headers: { 'X-TBA-Auth-Key': process.env.TBA_API_KEY! }
	});
	if (!res.ok) throw new Error(`TBA ${res.status} on ${path}`);
	return res.json();
}

// ---------- 1. get every team ----------
type TbaTeam = { team_number: number; nickname: string | null; name: string };

const allTeams: TbaTeam[] = [];
for (let page = 0; ; page++) {
	const batch = await tba<TbaTeam[]>(`/teams/${page}/simple`);
	if (batch.length === 0) break; // ran out of pages
	allTeams.push(...batch);
}
console.log(`Fetched ${allTeams.length} teams`);

// ---------- 1b. which teams are still active? ----------
// A team is "active" if it's registered for the current season.
const activeKeys = new Set<string>(); // looks like "frc254"
for (let page = 0; ; page++) {
	const keys = await tba<string[]>(`/teams/${THIS_YEAR}/${page}/keys`);
	if (keys.length === 0) break;
	keys.forEach((k) => activeKeys.add(k));
}
console.log(`${activeKeys.size} teams active in ${THIS_YEAR}`);

// ---------- 2. tally recent wins/finals per team ----------
// TBA event_type -> which "level" of competition it is
const BUCKET: Record<number, 'regional' | 'champs' | 'einstein'> = {
	0: 'regional', // regional event
	1: 'regional', // district event
	2: 'regional', // district championship
	5: 'regional', // district championship division
	3: 'champs', //   championship division
	4: 'einstein' //  Einstein (championship finals)
};

// TBA award_type: 0 = Chairman's (Impact), 1 = Winner, 2 = Finalist
const COUNTED_AWARDS = [0, 1, 2];

type Award = { award_type: number; recipient_list: { team_key: string | null }[] };
type Tally = { regional: number; champs: number; einstein: number };
const tallies = new Map<string, Tally>(); // key looks like "frc254"

for (let year = THIS_YEAR - YEARS_BACK + 1; year <= THIS_YEAR; year++) {
	const events = (
		await tba<{ key: string; event_type: number }[]>(`/events/${year}/simple`)
	).filter((e) => e.event_type in BUCKET); // skips offseason/preseason events

	// fetch awards 20 events at a time so we don't hammer the API
	for (let i = 0; i < events.length; i += 20) {
		const chunk = events.slice(i, i + 20);
		const results = await Promise.all(chunk.map((e) => tba<Award[]>(`/event/${e.key}/awards`)));

		results.forEach((awards, idx) => {
			const eventBucket = BUCKET[chunk[idx].event_type];
			for (const award of awards) {
				if (!COUNTED_AWARDS.includes(award.award_type)) continue;
				// Impact counts as "regional" level no matter where it was won
				const bucket = award.award_type === 0 ? 'regional' : eventBucket;
				for (const r of award.recipient_list) {
					if (!r.team_key) continue;
					const t = tallies.get(r.team_key) ?? { regional: 0, champs: 0, einstein: 0 };
					t[bucket]++;
					tallies.set(r.team_key, t);
				}
			}
		});
	}
	console.log(`Scored ${year}`);
}

// ---------- 3. turn a tally into a 1-5 NAM team-desirability score ----------
// Tweak these thresholds until the results feel right.
function namValue(t: Tally = { regional: 0, champs: 0, einstein: 0 }): number {
	if (t.einstein >= 2) return 5; // Einstein contender
	if (t.einstein >= 1 || t.champs >= 2) return 4; // champs contender
	if (t.champs >= 1 || t.regional >= 3) return 3; // regional powerhouse
	if (t.regional >= 1) return 2; // district/regional contender
	return 1; // everyone else
}

// ---------- 4. get colors ----------
type ColorsResponse = {
	teams: Record<string, { colors: { primaryHex: string; secondaryHex: string } | null }>;
};

const res = await fetch('https://api.frc-colors.com/v1/team?all');
const data: ColorsResponse = await res.json();

// ---------- 5. build rows and upsert ----------
const rows = allTeams.map((t) => {
	const colors = data.teams[t.team_number]?.colors;
	return {
		number: t.team_number,
		name: t.nickname ?? t.name, // nickname is the short name; `name` is the long sponsor list
		image: `https://www.thebluealliance.com/avatar/${THIS_YEAR}/frc${t.team_number}.png`,
		namValue: namValue(tallies.get(`frc${t.team_number}`)),
		active: activeKeys.has(`frc${t.team_number}`),
		primaryColor: colors?.primaryHex ?? null,
		secondaryColor: colors?.secondaryHex ?? null
	};
});

// "excluded" is Postgres's name for the row we tried to insert
const excluded = (col: AnyPgColumn) => sql.raw(`excluded."${col.name}"`);

for (let i = 0; i < rows.length; i += 500) {
	await db
		.insert(teams)
		.values(rows.slice(i, i + 500))
		.onConflictDoUpdate({
			target: teams.number, // needs a unique constraint / primary key on `number`
			set: {
				name: excluded(teams.name),
				image: excluded(teams.image),
				namValue: excluded(teams.namValue),
				active: excluded(teams.active),
				primaryColor: excluded(teams.primaryColor),
				secondaryColor: excluded(teams.secondaryColor)
			}
		});
}

console.log(`Upserted ${rows.length} teams`);
await client.end();
