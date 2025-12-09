// TODO: interaction with db

export async function connect() {}

export async function dbQuery(sql: string, args?: any[]): Promise<any> {}

export async function login(usr: string, pass: string) {
	return { auth: false, validUsr: false };
}

export async function hash(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
