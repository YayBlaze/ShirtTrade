<script lang="ts">
	import type { Snippet } from 'svelte';

	type ToastType = 'success' | 'warning' | 'error' | 'other';

	let {
		type = 'other',
		children,
		onclose
	}: { type?: ToastType; children?: Snippet; onclose?: () => void } = $props();

	const config: Record<ToastType, { color: string; icon: string }> = {
		success: { color: '--success', icon: 'M5 11.917 9.724 16.5 19 7.5' },
		error: { color: '--error', icon: 'M6 18 17.94 6M18 18 6.06 6' },
		warning: { color: '--warning', icon: 'M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
		other: { color: '--neutral', icon: 'm12 18-7 3 7-18 7 18-7-3Zm0 0v-5' }
	};

	let visible = $state(true);
</script>

{#if visible}
	<div
		class="flex w-full max-w-sm items-center rounded-lg border border-(--neutral)/30 bg-(--bg2) p-4 text-(--text) shadow-xs"
		style:--toast-color="var({config[type].color})"
		role="alert"
	>
		<div
			class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded"
			style="color: var(--toast-color); background: color-mix(in srgb, var(--toast-color) 15%, transparent);"
		>
			<svg
				class="h-5 w-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d={config[type].icon}
				/>
			</svg>
			<span class="sr-only">{type} icon</span>
		</div>

		<div class="ms-3 text-sm font-normal">
			{@render children?.()}
		</div>

		<button
			type="button"
			class="ms-auto box-border flex h-8 w-8 items-center justify-center rounded border border-transparent bg-transparent text-sm leading-5 font-medium text-(--neutral) hover:bg-(--bg) hover:text-(--text) focus:ring-4 focus:ring-(--neutral)/30 focus:outline-none"
			aria-label="Close"
			onclick={() => {
				visible = false;
				onclose?.();
			}}
		>
			<span class="sr-only">Close</span>
			<svg
				class="h-5 w-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18 17.94 6M18 18 6.06 6"
				/>
			</svg>
		</button>
	</div>
{/if}
