import { fetchGitHubLanguages, fetchGitHubContributions } from "./libs/github";
import { generateReadme } from "./libs/markdown";
import { generateLanguagesChart, generateStatsChart } from "./libs/svg";

async function run() {
	try {
		const gitHubContributions = await fetchGitHubContributions();

		await generateStatsChart({ gitHub: gitHubContributions });

		const gitHubLanguages = await fetchGitHubLanguages();

		await generateLanguagesChart(gitHubLanguages);

		await generateReadme();
	} catch (error) {
		console.error(error);

		process.exit(1);
	}
}

run();
