type ToastType = 'success' | 'warning' | 'error' | 'other';

export const toasts = $state<{ id: number; type: ToastType; message: string }[]>([]);

let nextId = 0;

export function remove(id: number) {
	const i = toasts.findIndex((t) => t.id === id);
	if (i !== -1) toasts.splice(i, 1);
}

function add(type: ToastType, message: string, ms = 5000) {
	const id = nextId++;
	toasts.unshift({ id, type, message });
	setTimeout(() => remove(id), ms);
}

export const toast = {
	success: (m: string) => add('success', m),
	warning: (m: string) => add('warning', m),
	error: (m: string) => add('error', m),
	other: (m: string) => add('other', m)
};
