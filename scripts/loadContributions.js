const path = require('path');
const { promises: fs } = require('fs');
const { graphql: unauthorizedGraphQL } = require('@octokit/graphql');
const yargs = require('yargs');

async function loadRepositoriesContributedToCursor(outputFilename) {
	const json = await fs.readFile(outputFilename, { encoding: 'utf-8' });
	const { after } = JSON.parse(json);

	return after ?? null;
}

async function loadRepositoriesContributedTo({ graphql, after }) {
	const userPullRequests = await graphql(
		`
			query repositoriesContributedTo($after: String) {
				user(login: "eps1lon") {
					pullRequests(
						states: MERGED
						first: 100
						orderBy: { field: CREATED_AT, direction: ASC }
						after: $after
					) {
						totalCount
						pageInfo {
							hasNextPage
							endCursor
						}
						nodes {
							repository {
								isPrivate
								nameWithOwner
								isFork
								stargazers {
									totalCount
								}
							}
						}
					}
				}
			}
		`,
		{
			after,
		},
	);

	const {
		nodes: pullRequests,
		pageInfo,
		totalCount,
	} = userPullRequests.user.pullRequests;

	return {
		nodesCount: pullRequests.length,
		totalCount,
		repositories: pullRequests
			.filter(({ repository }) => {
				return repository.isFork === false && repository.isPrivate === false;
			})
			.map(({ repository: { nameWithOwner, stargazers } }) => {
				return { name: nameWithOwner, stars: stargazers.totalCount };
			}),
		pageInfo,
	};
}

async function main(argv) {
	const githubToken = process.env.GITHUB_TOKEN;
	const outputFilename = path.resolve(argv.outputFilename);

	if (githubToken === undefined) {
		throw new Error(
			'No github token set in an environment variable named `GITHUB_TOKEN`',
		);
	}

	const graphql = unauthorizedGraphQL.defaults({
		headers: {
			authorization: `token ${githubToken}`,
		},
	});

	const repositoryStars = new Map();
	let after = null;
	try {
		after = await loadRepositoriesContributedToCursor(outputFilename);
		console.log('Resuming contributions query at "%s"', after);
	} catch (error) {
		console.warn(
			'Could not resume previous contributions query. Starting from the beginning.',
		);
	}
	let hasNextPage = true;
	let nodesProcessed = 0;
	while (hasNextPage) {
		const {
			nodesCount,
			totalCount,
			pageInfo,
			repositories: repositoryPage,
		} = await loadRepositoriesContributedTo({ graphql, after });

		repositoryPage.forEach(({ name, stars }) => {
			repositoryStars.set(name, stars);
		});

		nodesProcessed += nodesCount;
		console.log('%d/%d', nodesProcessed, totalCount);

		hasNextPage = pageInfo.hasNextPage;
		after = pageInfo.endCursor;
	}

	const repositories = Array.from(
		repositoryStars.entries(),
		([name, stars]) => {
			return { name, stars };
		},
	).sort((a, b) => b.stars - a.stars);
	const totalStars = repositories.reduce((stars, repository) => {
		return stars + repository.stars;
	}, 0);

	await fs.writeFile(
		outputFilename,
		JSON.stringify({
			after,
			repositories,
			totalStars,
			updatedAt: new Date().toISOString(),
		}),
	);
}

yargs
	.command({
		command: '$0 <outputFilename>',
		description: 'creates contribution stats',
		builder: (command) => {
			return command.positional('mode', {
				description: 'File where JSON data is written to.',
				type: 'string',
			});
		},
		handler: main,
	})
	.help()
	.strict(true)
	.version(false)
	.parse();
