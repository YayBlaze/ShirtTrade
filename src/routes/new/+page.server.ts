import { hash, login, dbQuery } from '$lib/db';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { v7 as uuid } from 'uuid';
import type { PageServerLoad } from '../logout/$types';

export const load: PageServerLoad = ({ url }) => {
	let searchParams = url.searchParams;
	let msg = searchParams.get('msg') ?? '';
	let color = searchParams.get('color') ?? '#ee2c2c';
	let usr = searchParams.get('usr') ?? '';
	return { msg, color, usr, pass: '' };
};

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		let usr = data.get('usr');
		let pass = data.get('pass');
		if (!usr) return fail(400, { auth: false, msg: 'Please provide a username', usr: usr });
		else usr = usr.toString();
		if (!pass) return fail(400, { auth: false, msg: 'Please provide a password', usr: usr });
		else pass = pass.toString();
		if (usr.includes(' ') || pass.includes(' ')) {
			return fail(400, { msg: 'Please do not include spaces in your username or password' });
		} else if (usr.length < 4 || usr.length > 15) {
			return fail(400, { msg: 'Your username must be 4-15 characters long' });
		} else if (pass.length < 4) {
			return fail(400, { msg: 'Please do not include spaces in your username or password.' });
		}
		let results = await dbQuery('SELECT id FROM users WHERE username = ?', [usr]);
		if (results.length > 0) return fail(400, { msg: 'Username taken' });
		const id = uuid();
		await dbQuery(
			'INSERT INTO users (id, username, password, balance, session_id, session_expire, allow_collect, birth_time, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[id, usr, await hash(pass.toString()), 1000, null, null, 0, Date.now(), false]
		);
		const sessionID = uuid();
		cookies.set('session', sessionID, { path: '/' });
		redirect(303, '/app');
	}
} satisfies Actions;
