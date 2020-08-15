const path = require('path');
const { promises: fs } = require('fs');
const { graphql: unauthorizedGraphQL } = require('@octokit/graphql');
const yargs = require('yargs');

async function loadRepositoriesContributedTo({ graphql, user, after }) {
	const repositoriesContributedTo = await graphql(
		`
			query repositoriesContributedTo($user: String!, $after: String) {
				user(login: $user) {
					repositoriesContributedTo(
						includeUserRepositories: false
						contributionTypes: [PULL_REQUEST]
						first: 100
						after: $after
					) {
						pageInfo {
							hasNextPage
							endCursor
						}
						nodes {
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
		`,
		{
			user,
			after,
		},
	);

	const {
		nodes: repositories,
		pageInfo,
	} = repositoriesContributedTo.user.repositoriesContributedTo;

	const loadNextPage = pageInfo.hasNextPage
		? () =>
				loadRepositoriesContributedTo({
					graphql,
					user,
					after: pageInfo.endCursor,
				})
		: null;

	return {
		repositories: repositories
			.filter((repository) => {
				return repository.isFork === false && repository.isPrivate === false;
			})
			.map(({ nameWithOwner, stargazers }) => {
				return { name: nameWithOwner, stars: stargazers.totalCount };
			}),
		loadNextPage,
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

	const repositories = [];
	let loadNextRepositoriesContributedToPage = () =>
		loadRepositoriesContributedTo({ graphql, user: 'eps1lon', after: null });
	while (loadNextRepositoriesContributedToPage !== null) {
		const {
			loadNextPage,
			repositories: repositoryPage,
		} = await loadNextRepositoriesContributedToPage();

		repositories.push(...repositoryPage);
		loadNextRepositoriesContributedToPage = loadNextPage;
	}

	const totalStars = repositories.reduce((stars, repository) => {
		return stars + repository.stars;
	}, 0);

	await fs.writeFile(
		outputFilename,
		JSON.stringify({
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
