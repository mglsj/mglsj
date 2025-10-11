import { CONFIG, THEMES } from "../config";

import { getLanguagesChartData, getStatsChartData, type Stats } from "./chart";
import { getStatsChartColors } from "./color";
import type { GitHubLanguages } from "./github";
import { compileTemplate } from "./template";

export async function generateStatsChart(stats: Stats) {
	const now = new Date();
	const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });

	for (const currentTheme of THEMES) {
		const theme = CONFIG.charts.colors[currentTheme];

		const statsChartData = await getStatsChartData(stats, theme);

		const gitHubColors = getStatsChartColors(theme.stats.gitHub);

		await compileTemplate(
			`${CONFIG.charts.stats.fileName}.svg`,
			`${CONFIG.charts.stats.fileName}-${currentTheme}.svg`,
			{
				CHART_DATA: statsChartData,
				CHART_HEIGHT:
					CONFIG.charts.stats.height - CONFIG.charts.stats.wrapperBorder * 2,
				CHART_OFFSET: CONFIG.charts.stats.offset,
				CHART_WIDTH:
					CONFIG.charts.stats.width -
					CONFIG.charts.stats.legend.width -
					CONFIG.charts.stats.wrapperBorder * 2,
				GITHUB_CONTRIBUTIONS: numberFormatter.format(stats.gitHub.total),
				LEGEND_GITHUB_TITLE_COLOR: gitHubColors.legendColor,
				LEGEND_GITHUB_VALUE_COLOR: gitHubColors.borderColor,

				LEGEND_SEPARATOR_X:
					CONFIG.charts.stats.width -
					CONFIG.charts.stats.legend.width -
					CONFIG.charts.stats.wrapperBorder * 2 +
					CONFIG.charts.stats.offset -
					3,
				LEGEND_X:
					CONFIG.charts.stats.width -
					CONFIG.charts.stats.legend.width -
					CONFIG.charts.stats.wrapperBorder * 2 +
					CONFIG.charts.stats.legend.margin.x +
					CONFIG.charts.stats.offset,
				LEGEND_Y:
					CONFIG.charts.stats.wrapperBorder +
					CONFIG.charts.stats.legend.margin.y,
				LEGEND_YEARS_COLOR: theme.stats.legend,
				SEPARATOR_COLOR: theme.separator,
				VIEW_BOX_HEIGHT: CONFIG.charts.stats.height,
				VIEW_BOX_WIDTH: CONFIG.charts.stats.width,
				WRAPPER_HEIGHT:
					CONFIG.charts.stats.height - CONFIG.charts.stats.wrapperBorder,
				WRAPPER_WIDTH:
					CONFIG.charts.stats.width - CONFIG.charts.stats.wrapperBorder,
				YEARS: `${now.getFullYear() - 1}-${now.getFullYear()}`,
			},
		);
	}
}

export async function generateLanguagesChart(languages: GitHubLanguages) {
	for (const currentTheme of THEMES) {
		const theme = CONFIG.charts.colors[currentTheme];

		const { data, legendColor } = await getLanguagesChartData(languages, theme);

		const limit = Math.min(CONFIG.charts.languages.limit, languages.length);
		const legendStyles = Array.from({ length: limit })
			.map((_, i) => `.language${i + 1} { fill: ${legendColor[i] ?? ""}; }`)
			.join("\n");

		const legendTspans = Array.from({ length: limit })
			.map((_, i) => {
				const name = languages[i]?.[0] ?? "";
				if (i === 0) {
					return `<tspan class="language${i + 1}" x="__LEGEND_X__" dy="__LEGEND_Y__">${name}</tspan>`;
				}
				return `<tspan class="language${i + 1}" x="__LEGEND_X__" dy="1.6em">${name}</tspan>`;
			})
			.join("\n");


		await compileTemplate(
			`${CONFIG.charts.languages.fileName}.svg`,
			`${CONFIG.charts.languages.fileName}-${currentTheme}.svg`,
			{
				CHART_DATA: data,
				CHART_HEIGHT:
					CONFIG.charts.languages.height -
					CONFIG.charts.languages.wrapperBorder * 2,
				CHART_OFFSET: CONFIG.charts.languages.offset,
				CHART_WIDTH:
					CONFIG.charts.languages.width -
					CONFIG.charts.languages.wrapperBorder * 2,
				LEGEND_STYLES: legendStyles,
				LEGEND_TSPANS: legendTspans,
				LEGEND_SEPARATOR_X:
					CONFIG.charts.languages.width +
					CONFIG.charts.languages.wrapperBorder +
					CONFIG.charts.languages.offset,
				LEGEND_X:
					CONFIG.charts.languages.width +
					CONFIG.charts.languages.wrapperBorder +
					CONFIG.charts.languages.offset +
					CONFIG.charts.languages.legend.margin.x,
				LEGEND_Y:
					CONFIG.charts.languages.wrapperBorder +
					CONFIG.charts.languages.legend.margin.y,
				SEPARATOR_COLOR: theme.separator,
				VIEW_BOX_HEIGHT:
					CONFIG.charts.languages.height + CONFIG.charts.languages.offset * 2,
				VIEW_BOX_WIDTH:
					CONFIG.charts.languages.width +
					CONFIG.charts.languages.offset +
					CONFIG.charts.languages.legend.width,
				WRAPPER_HEIGHT:
					CONFIG.charts.languages.height -
					CONFIG.charts.languages.wrapperBorder +
					CONFIG.charts.languages.offset * 2,
				WRAPPER_WIDTH:
					CONFIG.charts.languages.width -
					CONFIG.charts.languages.wrapperBorder +
					CONFIG.charts.languages.offset +
					CONFIG.charts.languages.legend.width,
			},
		);
	}
}
