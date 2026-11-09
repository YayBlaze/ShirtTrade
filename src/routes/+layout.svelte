<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';
	import { remove, toasts } from '$lib/toast.svelte.js';
	import Toast from './components/toast.svelte';

	const { children, data } = $props();
	const user = $derived(data.user);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<nav class="flex h-fit w-full justify-between bg-(--bg2) p-4">
	<div>
		{#if true}
			{@const href = resolve('/')}
			{@const here = page.url.pathname === href}
			<a
				{href}
				class="text-3xl font-bold decoration-wavy hover:text-[2rem] {here
					? 'underline'
					: 'hover:underline'} {here ? 'text-(--primary)' : 'text-(--text)'} {here
					? 'decoration-(--text)'
					: 'decoration-(--primary)'}"
				aria-label="Homepage"
				aria-current={here ? 'page' : undefined}
			>
				FRC Shirt Trading
			</a>
		{/if}
	</div>
	<div>
		{#if user}
			{@const href = resolve(`/user/${user.name}`)}
			{@const here = page.url.pathname.startsWith('/user')}

			<a {href} aria-label="User profile" aria-current={here ? 'page' : undefined}>
				{#if user.image}
					<img
						class="ring-default h-10 w-10 rounded-full p-1 ring-2 {here
							? 'ring-(--primary)'
							: 'ring-(--text)'} hover:scale-110"
						src={user.image}
						alt="Bordered avatar"
					/>
				{:else}
					<div
						class="bg-neutral-secondary-medium relative h-10 w-10 overflow-hidden rounded-full hover:scale-110"
					>
						<svg
							class="text-body-subtle absolute -left-1 h-12 w-12"
							viewBox="0 0 20 20"
							color={here ? 'var(--primary)' : 'var-(--text)'}
							xmlns="http://www.w3.org/2000/svg"
							><path
								fill-rule="evenodd"
								d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
								clip-rule="evenodd"
							></path></svg
						>
					</div>
				{/if}
			</a>
		{:else}
			<button
				class="button-secondary"
				onclick={() =>
					authClient.signIn.social({
						provider: 'discord',
						callbackURL: '/',
						newUserCallbackURL: '/user'
					})}>Sign In</button
			>
		{/if}
	</div>
</nav>
{@render children()}

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
	{#each toasts as t (t.id)}
		<Toast type={t.type} onclose={() => remove(t.id)}>{t.message}</Toast>
	{/each}
</div>
