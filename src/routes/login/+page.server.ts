import { login, dbQuery } from '$lib/db';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { v7 as uuid } from 'uuid';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const sessionID = cookies.get('session');
	const res = await dbQuery('SELECT session_expire, id FROM users WHERE session_id = ?', [
		sessionID
	]);
	if (res.length == 1 && res[0].session_expire > Date.now()) redirect(303, '/app');
	let searchParams = url.searchParams;
	let msg = searchParams.get('msg') ?? '';
	let color = searchParams.get('color') ?? '#ee2c2c';
	let usr = searchParams.get('usr') ?? '';
	return { msg, color, usr, pass: '' };
};

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		let usr = data.get('usr')?.toString();
		let pass = data.get('pass')?.toString();
		if (!usr) return fail(400, { auth: false, msg: 'Please provide a username', usr: usr });
		if (!pass) return fail(400, { auth: false, msg: 'Please provide a password', usr: usr });
		const { auth, validUsr } = await login(usr, pass);
		if (auth) {
			const res = await dbQuery('SELECT id FROM users WHERE username = ?', [usr]);
			const results = res[0];
			const sessionID = uuid();
			const sessionExpire = Date.now() + 24 * 60 * 60 * 1000;
			cookies.set('session', sessionID, { path: '/' });
			await dbQuery('UPDATE users SET session_id = ?, session_expire = ? WHERE id = ?', [
				sessionID,
				sessionExpire,
				results.id
			]);
			redirect(303, '/app');
		} else if (validUsr) {
			return fail(401, { auth, msg: 'Incorrect Password', usr: usr });
		} else {
			return fail(401, { auth, msg: 'Username not found', usr: usr });
		}
	}
} satisfies Actions;
