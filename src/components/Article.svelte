<script>
	import Webmentions from './Webmentions.svelte';

	export let description;
	export let publishedAt;
	export let readingTime;
	export let slug;
	export let title = 'Unknonw';

</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:url" content={`https://solverfox.dev/writings/${slug}`} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta name="Description" content={description} />
	<meta property="og:description" content={description} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:domain" value="solverfox.dev" />
	<meta name="twitter:creator" value="https://twitter.com/sebsilbermann/" />
	<meta name="twitter:title" value={title} />
	<meta name="twitter:description" value={description} />
	<meta name="twitter:label1" value="Published on" />
	<meta
		name="twitter:data1"
		value={new Date(publishedAt).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})}
	/>
	<meta name="twitter:label2" value="Reading Time" />
	<meta name="twitter:data2" value={readingTime} />
	<link rel="pingback" href="https://webmention.io/solverfox.dev/xmlrpc" />
	<link
		rel="webmention"
		href="https://webmention.io/solverfox.dev/webmention"
	/>
	<link
		rel="stylesheet"
		href="https://highlightjs.org/static/demo/styles/a11y-dark.css"
	/>
</svelte:head>

<article aria-details="webmentions">
	<slot />
</article>

<hr />
<Webmentions
	id="webmentions"
	target={`https://solverfox.dev/writing/${slug}`}
/>

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

	article :global(pre) {
		max-width: 100ch;
		tab-size: 2;
	}

	article :global(pre.hljs) :global(code) {
		all: unset;
	}

	/* break up long github issue links */
	article :global(a) {
		word-wrap: break-word;
	}

</style>
