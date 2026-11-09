import { auth } from '$lib/server/auth';
import { getAllTeams, getItemsFromPerson } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';

export const load: PageServerLoad = async ({ locals, params, request }) => {
	const user = locals.user;
	const viewingUser = params.slug;
	const viewingUserData = await auth.api.getUser({
		query: { id: viewingUser },
		headers: request.headers
	});
	if (!user && !viewingUserData) redirect(303, resolve('/user'));
	return {
		user: viewingUserData,
		inventory: await getItemsFromPerson(viewingUser),
		teams: await getAllTeams()
	};
};
