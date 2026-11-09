<script lang="ts">
	import { ITEM_TYPE_COLORS, SIZE_COLORS, CONDITION_COLORS } from '$lib';
	import Badge from '../../../components/badge.svelte';
	import Card from '../../../components/card.svelte';

	const { data } = $props();
	const user = $derived(data.user);
	const inventory = $derived(data.inventory);
	const teams = $derived(data.teams);
</script>

<h1 class="bold">{user.name}'s Inventory</h1>
<div class="flex size-full flex-wrap items-center justify-center gap-2">
	{#each inventory as item (item.itemID)}
		<Card title="{item.teamNumber} {item.itemType}" color={item.primaryColor}>
			<p>{item.teamNumber} - {teams.find((t) => t.number == item.teamNumber)?.name}</p>
			<span class="flex items-center gap-2">
				<Badge color={ITEM_TYPE_COLORS[item.itemType]}>{item.itemType}</Badge>
				<Badge color={SIZE_COLORS[item.size]}>{item.size}</Badge>
				<Badge color={CONDITION_COLORS[item.condition]}>{item.condition}</Badge>
			</span>
		</Card>
	{/each}
</div>
