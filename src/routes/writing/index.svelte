<script context="module" lang="ts">
	export function preload(this: any, { params, query }: any) {
		return this.fetch(`/writing.json`)
			.then((r: any) => r.json())
			.then((posts: Post[]) => {
				return { posts };
			});
	}
</script>

<script lang="ts">
	import Posts, { type Post } from '../../components/Posts.svelte';

	export let posts: Post[];
</script>

<svelte:head>
	<title>Writings</title>
</svelte:head>

<h1 id="writings-heading">Writings</h1>

<Posts labelledby="writings-heading" {posts} />

<style>
	h1 {
		margin-bottom: 0.5em;
	}
	:global([aria-labelledby='writings-heading']) {
		margin: 0 0 1em 0 !important;
	}
</style>
