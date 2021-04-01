<script context="module">
	export function preload({ params, query }) {
		return this.fetch(`/writing.json`)
			.then((r) => r.json())
			.then((posts) => {
				return { posts };
			});
	}
</script>

<script>
	import Posts from '../../components/Posts.svelte';

	export let posts;
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
