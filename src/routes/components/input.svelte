<script lang="ts">
	let {
		label,
		id = label,
		value = $bindable(),
		helper = null,
		error = null,
		format = null,
		process = null,
		options = null,
		disabled = false,
		styling = 'size-full'
	} = $props();
</script>

<div class="relative {styling} min-w-20">
	<input
		type="text"
		{id}
		name={id}
		class="text-heading nunito peer block w-full appearance-none bg-transparent px-2.5 pt-4 pb-2.5 focus:ring-0 focus:outline-none"
		placeholder=""
		oninput={() => {
			if (format) value = format(value);
			if (process) process(value);
		}}
		list={options ? `${id}-options` : undefined}
		bind:value
		{disabled}
	/>

	{#if options}
		<datalist id="{id}-options">
			{#each options as option (option)}
				<option value={option}></option>
			{/each}
		</datalist>
	{/if}

	<fieldset
		aria-hidden="true"
		class={[
			'border-default-medium rounded-base pointer-events-none absolute inset-0 -top-2 m-0 min-w-0 rounded-md border px-2',
			'peer-focus:border-brand',
			'peer-not-placeholder-shown:[&>legend]:max-w-full peer-focus:[&>legend]:max-w-full',
			error && 'border-(--error)'
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
		class="text-body peer-focus:text-fg-brand pointer-events-none absolute top-1/2 left-2.5 origin-left -translate-y-1/2 transition-all duration-300 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:scale-75 peer-focus:top-0 peer-focus:left-3 peer-focus:scale-75"
		>{label}</label
	>
</div>
{#if error}
	<p class="nunito mt-0 text-xs text-(--error)">{error}</p>
{:else if helper}
	<p id="floating_helper_text" class="text-body nunito mt-0 text-xs text-(--grey)">{helper}</p>
{/if}
