<script context="module" lang="ts">
	export interface Post {
		slug: string;
		description: string;
		title: string;
	}
</script>

<script lang="ts">
	

	/**
	 * id of the heading associated with this list of posts
	 * */
	export let labelledby: string;
	export let posts: Post[] = [];
</script>

<ul aria-labelledby={labelledby}>
	{#each posts as post}
		<!-- tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
		<li id={`post-${post.slug}`}>
			<a
				aria-describedby={`post-${post.slug}`}
				sapper:prefetch
				href="writing/{post.slug}"
			>
				{post.title}
			</a>
			<p>{post.description}</p>
		</li>
	{/each}
</ul>

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
