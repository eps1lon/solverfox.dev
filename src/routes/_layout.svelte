<script>
	import 'focus-visible/dist/focus-visible.min.js';
	import Nav from '../components/Nav.svelte';
	import Footer from '../components/Footer.svelte';
	import Webmentions from '../components/Webmentions.svelte';

	export let segment;
</script>

<style>
	main {
		position: relative;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}

	/* based on https://www.w3.org/TR/WCAG20-TECHS/slicenav.css from 2019-10-13 */
	.skipnav {
		position: absolute;
		text-align: left;
		margin: 0;
		padding: 0;
	}

	.skipnav a {
		width: 26em;
		display: block;
		color: #fff;
		background: #333;
		text-decoration: none;
		padding: 5px;
		position: absolute;
		left: -1000em;
		top: 0;
		font-weight: bold;
	}
	.skipnav a:visited {
		color: #fff;
	}
	.skipnav a:focus,
	.skipnav a:active {
		z-index: 99;
		top: 1em;
		left: 1em;
		color: #fff;
		background: #333 !important;
	}

	.skipnav a:hover {
		cursor: default;
	}
</style>

<div id="skipnav">
	<p class="skipnav">
		<a href="#maincontent">Skip to main content (Press Enter)</a>
	</p>
</div>

<Nav {segment} />

<main id="maincontent">
	<article aria-details="webmentions" role="mark">
		<slot />
	</article>
	<hr />
	<Webmentions id="webmentions" />
</main>

<Footer />
