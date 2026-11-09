<script lang="ts">
	let {
		label,
		id = label,
		value = $bindable(),
		helper = null,
		rows = 4,
		disabled = false,
		styling = 'size-full'
	} = $props();
</script>

<div class="relative {styling} min-w-20">
	<textarea
		{id}
		name={id}
		{rows}
		class="text-heading nunito peer block w-full resize-y appearance-none bg-transparent px-2.5 pt-4 pb-2.5 focus:ring-0 focus:outline-none"
		placeholder=""
		bind:value
		{disabled}></textarea>

	<fieldset
		aria-hidden="true"
		class={[
			'border-default-medium rounded-base pointer-events-none absolute inset-0 -top-2 m-0 min-w-0 rounded-md border px-2',
			'peer-focus:border-brand',
			'peer-not-placeholder-shown:[&>legend]:max-w-full peer-focus:[&>legend]:max-w-full'
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
		class="text-body peer-focus:text-fg-brand pointer-events-none absolute top-7 left-2.5 origin-left -translate-y-1/2 transition-all duration-300 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:scale-75 peer-focus:top-0 peer-focus:left-3 peer-focus:scale-75"
		>{label}</label
	>
</div>
{#if helper}
	<p class="text-body nunito mt-0 text-xs text-(--grey)">{helper}</p>
{/if}
