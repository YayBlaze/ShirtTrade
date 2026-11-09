<script lang="ts">
	let {
		label,
		id = label,
		value = $bindable(),
		helper = null,
		error = null,
		disabled = false,
		styling = 'size-full'
	} = $props();
</script>

<div class="group relative {styling} min-w-20">
	<div class="flex items-center gap-2 px-2.5 pt-4 pb-2.5">
		<input
			type="color"
			{id}
			name={id}
			class="h-6 w-8 cursor-pointer appearance-none border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
			bind:value
			{disabled}
		/>
		<input
			type="text"
			aria-label="{label} hex value"
			maxlength="7"
			class="text-heading nunito w-full bg-transparent focus:ring-0 focus:outline-none"
			bind:value
			{disabled}
		/>
	</div>

	<fieldset
		aria-hidden="true"
		class={[
			'border-default-medium rounded-base pointer-events-none absolute inset-0 -top-2 m-0 min-w-0 rounded-md border px-2',
			'group-focus-within:border-brand',
			error && 'border-(--error)'
		]}
	>
		<legend class="max-w-full overflow-hidden p-0 text-xs whitespace-nowrap opacity-0">
			<span class="px-1">{label}</span>
		</legend>
	</fieldset>

	<label
		for={id}
		class="text-body group-focus-within:text-fg-brand pointer-events-none absolute top-0 left-3 origin-left -translate-y-1/2 scale-75"
		>{label}</label
	>
</div>
{#if error}
	<p class="nunito mt-0 text-xs text-(--error)">{error}</p>
{:else if helper}
	<p class="text-body nunito mt-0 text-xs text-(--grey)">{helper}</p>
{/if}
