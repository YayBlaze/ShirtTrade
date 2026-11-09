import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getActiveTeamNumbers, getAllTeams, getItemsFromPerson, newItem } from '$lib/server/db';
import { auth } from '$lib/server/auth';
import { isAPIError } from 'better-auth/api';
import { hasProfanity, type Item } from '$lib';
import { resolve } from '$app/paths';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user;
	if (!user) redirect(303, '/');
	else if (user.id != params.slug) redirect(303, resolve(`/user/${params.slug}/inventory`));
	return {
		user,
		activeNumbers: await getActiveTeamNumbers(),
		teams: await getAllTeams(),
		inventory: await getItemsFromPerson(user.id)
	};
};

function validateName(name: string) {
	if (name.length < 2) return 'Username must be at least 2 characters.';
	if (name.length > 32) return 'Username can be at most 32 characters.';
	if (/[^a-z0-9_.]/.test(name))
		return 'Use only lowercase letters, numbers, underscores, and periods.';
	if (name.includes('..')) return 'Username cannot have two periods in a row.';
	if (hasProfanity(name)) return 'That username is not allowed.';
	return null;
}

export const actions = {
	updateUser: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('Username')?.toString();
		const teamNumber = Number(data.get('Team')?.toString());
		if (!name || !teamNumber) return fail(400, { message: 'Missing data' });
		if (validateName(name) != null) return fail(400, { message: validateName(name) });
		try {
			await auth.api.updateUser({ headers: request.headers, body: { name, teamNumber } });
		} catch (e) {
			if (isAPIError(e)) {
				return fail(Number(e.status) || 400, { message: e.body?.message ?? 'Update failed' });
			}
			console.error(e);
			return fail(500, { message: 'Something went wrong' });
		}
		return { message: 'Saved Successfully' };
	},
	newItem: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const data = await request.formData();
		const itemStr = data.get('fullItem')?.toString();
		if (!itemStr) return fail(400, { message: 'Missing Data' });
		const itemData: Item = JSON.parse(itemStr);
		itemData.ownerID = locals.user?.id;
		await newItem(itemData);
		return { message: `Successfully added ${itemData.teamNumber} ${itemData.itemType}` };
	}
} satisfies Actions;
