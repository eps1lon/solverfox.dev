<style>
	article :global(h1 + p) {
		margin-left: 4em;
		margin-bottom: 2em;
	}

	article :global(h2),
	article :global(h3),
	article :global(h4),
	article :global(h5),
	article :global(h6) {
		text-transform: initial;
	}

	article :global(code) {
		all: unset;
	}

	article :global(pre) {
		max-width: 100ch;
	}

	/* break up long github issue links */
	article :global(a) {
		word-wrap: break-word;
	}
</style>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://highlightjs.org/static/demo/styles/a11y-dark.css" />
</svelte:head>

<article>
	<slot />
</article>
