const path = require('path');
const { promises: fs } = require('fs');
const { graphql: unauthorizedGraphQL } = require('@octokit/graphql');
const yargs = require('yargs');

async function loadLastRun(outputFilename) {
	try {
		const json = await fs.readFile(outputFilename, { encoding: 'utf-8' });
		const { after, repositories } = JSON.parse(json);

		return { after, repositories };
	} catch {
		return { after: null, repositories: [] };
	}
}

async function loadRepositoriesContributedTo({ graphql, after }) {
	const userPullRequests = await graphql(
		`
			query repositoriesContributedTo($after: String) {
				user(login: "eps1lon") {
					pullRequests(
						states: [MERGED, CLOSED]
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
							state
							repository {
								isPrivate
								nameWithOwner
								isFork
								stargazers {
									totalCount
								}
							}
							labels(first: 100) {
								nodes {
									name
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
			.filter(({ labels: { nodes: labels }, repository, state }) => {
				if (state === 'CLOSED') {
					// Certain repositories merge PRs in a separate commit that will cause GH to not consider them "MERGED".
					// The following logic implements repository-custom "merged"
					switch (repository.nameWithOwner) {
						case 'facebook/hermes':
						case 'facebook/react-native':
							return labels.find(({ name }) => name === 'Merged');
						default:
							return false;
					}
				}
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

	const lastRun = await loadLastRun(outputFilename);
	const repositoryStars = new Map(
		lastRun.repositories.map(({ name, stars }) => [name, stars]),
	);
	let after = lastRun.after;
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
		// If we stop we might just have 30/100 items loaded
		// So we want to resume that page later
		if (hasNextPage) {
			after = pageInfo.endCursor;
		}
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
