<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		Condition,
		hasProfanity,
		ITEM_TYPE_COLORS,
		ItemType,
		Size,
		SIZE_COLORS,
		type Item,
		type Team
	} from '$lib';
	import { authClient } from '$lib/auth-client.js';
	import { toast } from '$lib/toast.svelte.js';
	import Badge from '../../components/badge.svelte';
	import Card from '../../components/card.svelte';
	import Input from '../../components/input.svelte';
	import Textarea from '../../components/textarea.svelte';
	import Select from '../../components/select.svelte';
	import ColorInput from '../../components/colorInput.svelte';
	import { fade, fly } from 'svelte/transition';

	const { data } = $props();
	let original = $derived(data.user);
	// eslint-disable-next-line svelte/prefer-writable-derived
	let user = $state($state.snapshot(data.user));
	const activeNumbers = $derived(data.activeNumbers);
	const teams: Team[] = $derived(data.teams);
	const items: Item[] = $derived(data.inventory);

	$effect.pre(() => {
		user = $state.snapshot(original); // reset the editable copy when new data loads
	});
	let isDirty = $derived(JSON.stringify(user) !== JSON.stringify(original));

	const forceLowercase = (str: string) => str.toLocaleLowerCase();

	function validateName(name: string) {
		if (name.length < 2) return 'Username must be at least 2 characters.';
		if (name.length > 32) return 'Username can be at most 32 characters.';
		if (/[^a-z0-9_.]/.test(name))
			return 'Use only lowercase letters, numbers, underscores, and periods.';
		if (name.includes('..')) return 'Username cannot have two periods in a row.';
		if (hasProfanity(name)) return 'That username is not allowed.';
		return null;
	}

	let showModal = $state(false);
	let newItem: Item = $state({
		itemID: '',
		ownerID: '',
		teamNumber: user.teamNumber,
		itemType: ItemType.Shirt,
		tradeability: 5,
		size: Size.M,
		description: '',
		year: new Date().getFullYear().toString(),
		primaryColor: '',
		secondaryColor: '',
		condition: Condition.Unworn,
		nam: 0,
		quantity: 0
	});
	let tradeabilityStr = $state('');
	let newItemTeamName = $state(teams.find((t) => t.number == newItem.teamNumber)?.name);
	newItem.primaryColor = teams.find((t) => t.number == newItem.teamNumber)?.primaryColor ?? '';
	newItem.secondaryColor = teams.find((t) => t.number == newItem.teamNumber)?.secondaryColor ?? '';

	const errors = $derived({
		name: validateName(user.name),
		number: activeNumbers.includes(Number(user.teamNumber)) ? null : 'Invalid Team',
		newItemTeam: teams.flatMap((t) => t.number).includes(Number(newItem.teamNumber))
			? null
			: 'Invalid Team',
		year:
			+newItem.year >= 1989 && +newItem.year <= new Date().getFullYear()
				? null
				: `Year must be between 1989 and ${new Date().getFullYear()}`,
		nam: newItem.nam >= 0 && newItem.nam <= 12 ? null : 'Must be between 0-12'
	});
	let isValid = $derived(Object.values(errors).every((e) => e === null));

	function calculateNAM() {
		let score = teams.find((t) => newItem.teamNumber == t.number)?.namValue ?? 1;
		score += Math.round(newItem.tradeability / 2);
		if (newItem.itemType == ItemType.Shirt) score += 0;
		else if (newItem.itemType == ItemType.Hat || newItem.itemType == ItemType.Polo) score++;
		else score += 2;
		if (newItem.condition == Condition.Minor) score--;
		else if (newItem.condition == Condition.Major) score -= 2;
		newItem.nam = score;
	}

	function blend(top: number, bottom: number, alpha: number): number {
		return top * alpha + bottom * (1 - alpha);
	}

	function getTextColor(hex: string): 'bg2' | 'text' {
		let h = hex.replace('#', '');
		if (h.length === 3) {
			h = h
				.split('')
				.map((c) => c + c)
				.join(''); // "abc" -> "aabbcc"
		}

		const r = parseInt(h.slice(0, 2), 16);
		const g = parseInt(h.slice(2, 4), 16);
		const b = parseInt(h.slice(4, 6), 16);

		const blendedR = blend(r, 0x25, 0.25);
		const blendedG = blend(g, 0x25, 0.25);
		const blendedB = blend(b, 0x25, 0.25);

		const brightness = (blendedR * 299 + blendedG * 587 + blendedB * 114) / 1000;
		return brightness > 128 ? 'bg2' : 'text';
	}
</script>

<h1 class="m-auto mt-4 size-fit text-4xl font-bold">Welcome {user.name}</h1>

<Card title="Inventory">
	<button class="button-primary w-30" onclick={() => (showModal = true)}>New Item</button>
	<button class="button-secondary w-30">Detailed View</button>
	<div class="flex max-h-55 flex-col gap-2 overflow-y-scroll">
		{#each items as item (item.itemID)}
			<div
				class="flex w-fit items-center gap-2 rounded-lg border-2 border-(--main-color) bg-(--main-color)/25 p-2"
				style="--main-color: {item.primaryColor}; color: var(--{getTextColor(item.primaryColor)})"
			>
				<p>{item.teamNumber}</p>
				<Badge color={ITEM_TYPE_COLORS[item.itemType]}>{item.itemType}</Badge>
				<Badge color={SIZE_COLORS[item.size]}>{item.size}</Badge>
				<p>{item.year}</p>
			</div>
		{/each}
	</div>
</Card>

{#if showModal}
	<div
		transition:fade={{ duration: 250 }}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
	>
		<form
			class="flex h-fit w-100 flex-col items-center justify-center gap-3 rounded-lg border border-(--text)/10 bg-(--bg2) p-4 pr-20 pl-20 shadow-lg"
			method="post"
			action="?/newItem"
			transition:fly={{ duration: 500, y: -500 }}
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success((result.data?.message as string) ?? 'Successfully added item');
						showModal = false;
					} else if (result.type === 'failure')
						toast.error((result.data?.message as string) ?? 'Something went wrong.');
					else if (result.type === 'error') toast.error(result.error.message);

					await update();
				};
			}}
		>
			<Input
				label="Team Number"
				options={teams.flatMap((t) => t.number)}
				bind:value={newItem.teamNumber}
				process={() => {
					let team = teams.find((t) => t.number == newItem.teamNumber);
					newItemTeamName = team?.name ?? '';
					newItem.primaryColor = team?.primaryColor ?? '';
					newItem.secondaryColor = team?.secondaryColor ?? '';
					calculateNAM();
				}}
				error={errors.newItemTeam}
			></Input>
			<Input label="Team Name" bind:value={newItemTeamName} disabled></Input>
			<Select
				label="Item Type"
				bind:value={newItem.itemType}
				options={Object.values(ItemType)}
				process={calculateNAM}
			></Select>
			<Select label="Size" bind:value={newItem.size} options={Object.values(Size)}></Select>
			<Textarea label="Description" bind:value={newItem.description}></Textarea>
			<Input label="Year" bind:value={newItem.year} error={errors.year}></Input>
			<Select
				label="Condition"
				bind:value={newItem.condition}
				options={Object.values(Condition)}
				process={calculateNAM}
			></Select>
			<ColorInput label="Primary Color" bind:value={newItem.primaryColor}></ColorInput>
			<ColorInput label="Secondary Color" bind:value={newItem.secondaryColor}></ColorInput>
			<Select
				label="Tradeability"
				bind:value={tradeabilityStr}
				options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
				helper="1 is a common item, 10 is an exclusive or limited addition item"
				process={() => {
					newItem.tradeability = Number(tradeabilityStr);
					calculateNAM();
				}}
			></Select>
			<Input
				label="NAM Score"
				bind:value={newItem.nam}
				helper="Auto calcualted -- change only if deemed incorrect"
			></Input>
			<input type="hidden" name="fullItem" value={JSON.stringify(newItem)} />
			<button type="submit" class="button-primary w-full" disabled={!isValid}>Add Item</button>
			<button type="button" class="button-secondary w-full" onclick={() => (showModal = false)}
				>Cancel</button
			>
		</form>
	</div>
{/if}

<form
	action="?/updateUser"
	method="post"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') toast.success((result.data?.message as string) ?? 'Success');
			else if (result.type === 'failure')
				toast.error((result.data?.message as string) ?? 'Something went wrong.');
			else if (result.type === 'error') toast.error(result.error.message);

			await update();
		};
	}}
>
	<Card title="User Information">
		<Input
			label="Username"
			styling="w-50"
			bind:value={user.name}
			format={forceLowercase}
			error={errors.name}
		></Input>
		<Input
			label="Team"
			styling="w-50"
			bind:value={user.teamNumber}
			options={activeNumbers}
			error={errors.number}
		></Input>
	</Card>
	{#if isDirty}
		<div
			class="fixed inset-x-0 bottom-10 z-10 mx-auto flex h-fit w-250 justify-between rounded-2xl border border-white/10 bg-(--bg2) p-4 shadow-lg"
		>
			<div class="flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="var(--warning)"
					class="size-12"
				>
					<path
						fill-rule="evenodd"
						d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
						clip-rule="evenodd"
					/>
				</svg>
				<p class="text-xl">Changes not saved!</p>
			</div>
			<div class="flex gap-2">
				<button type="submit" class="button-primary" disabled={!isValid}>Save</button>
				<button
					type="button"
					class="button-destructive"
					onclick={() => {
						toast.success('Successfully Reset Changes');
						invalidateAll();
					}}>Reset</button
				>
			</div>
		</div>
	{/if}
</form>

<Card title="Danger Zone" color="error">
	<span class="flex justify-between">
		<p class="text-(--text)">Logout</p>
		<button
			class="button-destructive"
			onclick={async () =>
				await authClient.signOut({
					fetchOptions: {
						onSuccess: () => {
							goto(resolve('/'));
						}
					}
				})}>Logout</button
		>
	</span>
	<span class="flex justify-between">
		<p class="text-(--error)">Delete Acount</p>
		<button
			class="button-destructive"
			onclick={async () => {
				if (confirm('Are you sure you want to delete your acount?')) await authClient.deleteUser();
			}}>Delete Acount</button
		>
	</span>
</Card>
