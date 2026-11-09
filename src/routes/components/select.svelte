<script lang="ts">
	let {
		label,
		id = label,
		value = $bindable(''),
		helper = null,
		options = [],
		getLabel = (option: unknown) => String(option),
		disabled = false,
		styling = 'size-full',
		process = null
	} = $props();

	const filled = $derived(value !== '' && value != null);
</script>

<div class="relative {styling} min-w-20">
	<select
		{id}
		name={id}
		class="text-heading nunito peer block w-full appearance-none bg-(--bg2) px-2.5 pt-4 pr-8 pb-2.5 focus:ring-0 focus:outline-none"
		bind:value
		{disabled}
		onchange={process}
	>
		<option value="" disabled hidden></option>
		{#each options as option (option)}
			<option value={option}>{getLabel(option)}</option>
		{/each}
	</select>

	<svg
		aria-hidden="true"
		class="peer-focus:text-fg-brand text-body pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
	>
		<path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
	</svg>

	<fieldset
		aria-hidden="true"
		class={[
			'border-default-medium rounded-base pointer-events-none absolute inset-0 -top-2 m-0 min-w-0 rounded-md border px-2',
			'peer-focus:border-brand peer-focus:[&>legend]:max-w-full',
			filled && '[&>legend]:max-w-full'
		]}
	>
		<legend
			class="max-w-0 overflow-hidden p-0 text-xs whitespace-nowrap opacity-0 transition-all duration-300"
		>
			<span class="px-1">{label}</span>
		</legend>
	</fieldset>

	<label
		for={id}
		class={[
			'text-body peer-focus:text-fg-brand pointer-events-none absolute origin-left -translate-y-1/2 transition-all duration-300',
			'peer-focus:top-0 peer-focus:left-3 peer-focus:scale-75',
			filled ? 'top-0 left-3 scale-75' : 'top-1/2 left-2.5'
		]}>{label}</label
	>
</div>
{#if helper}
	<p class="text-body nunito mt-0 text-xs text-(--grey)">{helper}</p>
{/if}
