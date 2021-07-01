<script>
	import GitHubCorner from '../components/GitHubCorner.svelte';

	export let segment;

</script>

<nav>
	<ul>
		<li>
			<a aria-current={segment === undefined ? 'page' : undefined} href=".">
				solverfox.dev
			</a>
		</li>
		{#if process.env.FEATURE_POSTS}
			<li>
				<a
					sapper:prefetch
					aria-current={segment === 'writing' ? 'page' : undefined}
					href="writing"
				>
					writing
				</a>
			</li>
		{/if}
		<li>
			<a aria-current={segment === 'oss' ? 'page' : undefined} href="oss">
				OSS
			</a>
		</li>
		<li>
			<a aria-current={segment === 'about' ? 'page' : undefined} href="about">
				about
			</a>
		</li>
	</ul>
</nav>

<GitHubCorner repo="eps1lon/solverfox.dev" />

<style>
	nav {
		border-bottom: 2px solid #d8c3a5;
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: #e85a4f;
		display: block;
		bottom: -2px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}

</style>
