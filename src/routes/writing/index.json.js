// @ts-nocheck
import frontMatter from 'front-matter';
import * as fs from 'fs';
import glob from 'glob';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

const promisedPosts = (async (resolve, reject) => {
	// process.cwd is the root for some reason while __dirname is inside __sapper__
	const writingsDir = path.resolve('src/routes/writing');
	const files = await glob.glob(path.join(writingsDir, '*.svx'));

	const posts = await Promise.all(
		files.map(async (filePath) => {
			const slug = path.basename(filePath, '.svx');
			const source = await readFile(filePath, 'utf8');
			const { attributes } = frontMatter(source);

			if (attributes.slug !== undefined && attributes.slug !== slug) {
				throw new TypeError(
					`front-matter data had a different slug ('${attributes.slug}' vs. '${slug}'). This is bad for SEO.`,
				);
			}

			return {
				...attributes,
				slug,
			};
		}),
	);

	const publishedPosts = posts
		.filter((post) => post.publishedAt !== undefined)
		.sort((a, b) => {
			return b.publishedAt - a.publishedAt;
		});

	return publishedPosts;
})();

export async function get(req, res, next) {
	const posts = await promisedPosts;

	res.writeHead(200, {
		'Content-Type': 'application/json',
	});

	res.end(JSON.stringify(posts));
}
