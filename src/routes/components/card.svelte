<script>
	let { title, children, color = 'white' } = $props();
</script>

<fieldset
	class="m-auto flex h-fit w-[95%] flex-col gap-2 rounded-lg border-5 border-(--main-color) p-4"
	style="--main-color: var(--{color})"
>
	<legend class="ml-2 px-2 text-3xl font-medium text-(--main-color)">{title}</legend>
	{@render children?.()}
</fieldset>
