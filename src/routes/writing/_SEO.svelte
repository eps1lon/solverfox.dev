<script>
	export let data = {};

	const {
		description,
		publishedAt,
		readingTime,
		slug,
		title = 'Unknonw',
	} = data;
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
		})} />
	<meta name="twitter:label2" value="Reading Time" />
	<meta name="twitter:data2" value={readingTime} />
	<link rel="pingback" href="https://webmention.io/solverfox.dev/xmlrpc" />
	<link
		rel="webmention"
		href="https://webmention.io/solverfox.dev/webmention" />
</svelte:head>
