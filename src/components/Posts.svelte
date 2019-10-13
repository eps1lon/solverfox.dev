<script>
	/**
	 * id of the heading associated with this list of posts
	 * */
	export let labelledby;
	/**
	 * @type {Array<{ slug: string, description: string, title: string}>}
	 */
	export let posts = [];
</script>

<style>
	ul {
		display: block;
		margin: 0 auto;
		max-width: 80ch;
	}

	li p {
		margin: unset;
		margin-left: 1em;
	}
</style>

<ul aria-labelledby={labelledby}>
	{#each posts as post}
		<!-- we're using the non-standard `rel=prefetch` attribute to
				tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
		<li id={`post-${post.slug}`}>
			<a
				aria-describedby={`post-${post.slug}`}
				rel="prefetch"
				href="writing/{post.slug}">
				{post.title}
			</a>
			<p>{post.description}</p>
		</li>
	{/each}
</ul>
