const GITHUB_USERNAME = "GITHUB_USERNAME";
const GITHUB_TOKEN = "GITHUB_TOKEN";

const BASE_URL = 'https://api.github.com';

// Headers for authentication
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

async function fetchRepos() {
  try {
    let repos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${BASE_URL}/user/repos?per_page=100&page=${page}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.statusText}`);
      }

      const data = await response.json();
      repos = repos.concat(data);

      // Check if there are more pages
      const linkHeader = response.headers.get('Link');
      hasMore = linkHeader && linkHeader.includes('rel="next"');
      page++;
    }

    return repos;
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    process.exit(1);
  }
}

async function renameRepo(repo, newName) {
  try {
    const url = `${BASE_URL}/repos/${GITHUB_USERNAME}/${repo.name}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to rename repository: ${response.statusText}`);
    }

    console.log(`Renamed ${repo.name} to ${newName}`);
  } catch (error) {
    console.error(`Error renaming ${repo.name}:`, error.message);
  }
}

async function main() {
  const repos = await fetchRepos();
  for (const repo of repos) {
    const currentName = repo.name;
    if (currentName !== currentName.toLowerCase()) {
      const newName = currentName.toLowerCase();
      await renameRepo(repo, newName);
    }
  }
}

main();