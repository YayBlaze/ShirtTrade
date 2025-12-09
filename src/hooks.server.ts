import { connect, dbQuery } from '$lib/db';
import type { Handle, ServerInit } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const init: ServerInit = async () => {
	await connect();
};

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname == '/' || event.url.pathname == '/new') return await resolve(event);
	const sessionID = event.cookies.get('session');
	event.locals.sessionID = sessionID ?? null;
	const res = await dbQuery('SELECT session_expire, id FROM users WHERE session_id = ?', [
		sessionID
	]);
	if (res.length != 1) return redirect(303, '/?msg=Invalid Session - Log in again');
	const response = res[0];
	if (response.session_expire < Date.now())
		return redirect(303, '/?msg=Session Expired - Log in again');
	return await resolve(event);
};
