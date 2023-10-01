<script context="module" lang="ts">
	type SveltePreload = any;
	export async function preload(this: SveltePreload) {
		const res = await this.fetch(`/writing.json`);
		const posts = await res.json();

		if (res.status === 200) {
			return { posts };
		} else {
			this.error(res.status, res.message);
		}
	}
</script>

<script lang="ts">
	import Posts, { type Post } from '../components/Posts.svelte';

	export let posts: Post[];
</script>

<svelte:head>
	<title>solverfox.dev</title>
</svelte:head>

<h1>solverfox.dev</h1>

<p>
	Hey there! My name is
	<strong>Sebastian</strong>
	and I'm a frontend developer with a focus on accessibility and developer tooling.
	I'm a member of the
	<a href="https://react.dev/community/team" target="_blank" rel="noopener"
		>React Core team</a
	>,
	<a href="https://testing-library.com/" target="_blank" rel="noopener"
		>Testing Library</a
	>
	core team and
	<a href="/oss">several other popular open-source libraries</a>
</p>

{#if process.env.FEATURE_POSTS}
	<h2 id="posts-heading">Recent posts</h2>

	<Posts labelledby="posts-heading" {posts} />
{/if}

<style>
	h1,
	p {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		text-transform: initial;
	}

	p {
		text-align: left;
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}

	#posts-heading {
		text-align: center;
	}
</style>
