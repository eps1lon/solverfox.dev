<script context="module">
	export async function preload() {
		// the `slug` parameter is available because
		// this file is called [slug].svelte
		const res = await this.fetch(`writing.json`);
		const data = await res.json();

		if (res.status === 200) {
			return { post: data };
		} else {
			this.error(res.status, data.message);
		}
	}
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

<h1>Great success!</h1>

<p>
	<strong>
		Try editing this file (src/routes/index.svelte) to test live reloading.
	</strong>
</p>
