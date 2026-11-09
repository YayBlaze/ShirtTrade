<script>
	let { color, children } = $props();
</script>

<span
	class="rounded border border-(--badge-color) bg-(--badge-color)/15 px-1.5 py-0.5 text-(--badge-color)"
	style="--badge-color: {color}"
>
	{@render children?.()}
</span>
