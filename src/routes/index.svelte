<script context="module">
	export async function preload() {
		// the `slug` parameter is available because
		// this file is called [slug].svelte
		const res = await this.fetch(`/writing.json`);
		const posts = await res.json();

		if (res.status === 200) {
			return { posts };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script>
	export let posts;
</script>

<style>
	h1,
	p {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
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
</style>

<svelte:head>
	<title>solverfox.dev</title>
</svelte:head>

<h1>solverfox.dev</h1>

<p>
	Hey there! My name is
	<strong>Sebastian</strong>
	and I'm a frontent developer with a focus on accessibility and developer
	tooling. I'm a member of the core team working on
	<a href="https://material-ui.com">Material-UI</a>
	and member of
	<a href="/oss">several other popular open-source libraries</a>
</p>

{#if process.env.FEATURE_POSTS}
	<h2>Recent posts</h2>

	<ul>
		{#each posts as post}
			<!-- we're using the non-standard `rel=prefetch` attribute to
				tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
			<li>
				<a rel="prefetch" href="writing/{post.slug}">{post.title}</a>
			</li>
		{/each}
	</ul>
{/if}
