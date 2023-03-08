/* eslint-env node */
import hljs from 'highlight.js';
import { mdsvex } from 'mdsvex';
import * as path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import pkg from './package.json';

const featureFlags = {
	posts: true,
};

const preprocess = () => {
	return mdsvex({
		extension: '.svx',
		highlight: {
			highlighter(code, lang) {
				if (lang && hljs.getLanguage(lang)) {
					try {
						const highlighted =
							'{@html `<pre class="hljs"><code>' +
							hljs
								.highlight(lang, code, true)
								.value.replace(/{/g, '&#123;')
								.replace(/}/g, '&#125;')
								.replace(/`/g, '\\`') +
							'</code></pre>`}';

						return highlighted;
					} catch (error) {
						console.error(error);
					}
				}

				return '';
			},
		},
		layout: {
			article: './src/components/Article.svelte',
		},
	});
};

const defaultReplaces = Object.fromEntries(
	Object.entries(featureFlags).map(([key, value]) => {
		return [`process.env.FEATURE_${key.toUpperCase()}`, JSON.stringify(value)];
	}),
);

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) => {
	return (
		(warning.code === 'MISSING_EXPORT' && warning.binding === 'preload') ||
		(warning.code === 'CIRCULAR_DEPENDENCY' &&
			/[/\\]@sapper[/\\]/.test(warning.message)) ||
		onwarn(warning)
	);
};

const moduleExtensions = ['.mjs', '.js', '.json', '.node'];

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
			replace({
				...defaultReplaces,
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode),
			}),
			svelte({
				compilerOptions: {
					dev,
					hydratable: true,
				},
				emitCss: true,
				extensions: ['.svelte', '.svx'],
				preprocess: preprocess(),
			}),
			resolve({
				extensions: moduleExtensions,
			}),
			commonjs(),

			legacy &&
				babel({
					extensions: ['.js', '.mjs', '.html', '.svelte'],
					runtimeHelpers: true,
					exclude: [/node_modules\/@babel/],
					presets: [
						[
							'@babel/preset-env',
							{
								targets: '> 0.25%, not dead',
							},
						],
					],
					plugins: [
						'@babel/plugin-syntax-dynamic-import',
						[
							'@babel/plugin-transform-runtime',
							{
								absoluteRuntime: true,
								useESModules: true,
							},
						],
					],
				}),

			!dev &&
				terser({
					module: true,
				}),
		],

		preserveEntrySignatures: false,
		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
			replace({
				...defaultReplaces,
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode),
			}),
			svelte({
				compilerOptions: {
					dev,
					generate: 'ssr',
				},
				extensions: ['.svelte', '.svx'],
				preprocess: preprocess(),
			}),
			resolve({
				extensions: moduleExtensions,
			}),
			commonjs(),
		],
		external: Object.keys(pkg.dependencies).concat(
			require('module').builtinModules ||
				Object.keys(process.binding('natives')),
		),

		preserveEntrySignatures: 'strict',
		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve({
				extensions: moduleExtensions,
			}),
			replace({
				...defaultReplaces,
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode),
			}),
			commonjs(),
			!dev && terser(),
		],

		preserveEntrySignatures: false,
		onwarn,
	},
};
