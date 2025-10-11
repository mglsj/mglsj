import type { ChartDataset } from "chart.js";
import { format } from "date-fns";
import QuickChart from "quickchart-js";
import { CONFIG, type Theme } from "../config";
import { getLanguagesChartColors, getStatsChartColors } from "./color";
import type { GitHubLanguages, GitHubContributions } from "./github";

export async function getStatsChartData({ gitHub }: Stats, theme: Theme) {
	const chart = getNewChart(
		CONFIG.charts.stats.width -
		CONFIG.charts.stats.legend.width -
		CONFIG.charts.stats.wrapperBorder * 2,
		CONFIG.charts.stats.height - CONFIG.charts.stats.wrapperBorder * 2,
		theme.background,
	);

	const gitHubContributions = gitHub.all.map(
		(contribution) => contribution.count,
	);

	const dataMax = gitHubContributions.length ? Math.max(...gitHubContributions) : 0;

	const paddedMax = Math.max(1, Math.ceil(dataMax * 1.1));
	const yMax = paddedMax;

	chart.setConfig({
		data: {
			datasets: [
				{
					...getNewDataSet(getStatsChartColors(theme.stats.gitHub)),
					data: gitHubContributions,
					fill: "origin",
					yAxisID: "yContributionAxis",
				},
			],
			labels: gitHub.all.map((contribution, index) =>
				index % 2 !== 0 ? format(new Date(contribution.date), "MMM yyyy") : "",
			),
		},
		options: {
			layout: {
				padding: {
					bottom: 5,
					top: 5,
				},
			},
			plugins: {
				legend: {
					display: false,
				},
			},
			scales: {
				xAxis: {
					grid: {
						display: false,
					},
					ticks: {
						autoSkip: false,
						color: theme.tick,
						maxRotation: 0,
						minRotation: 0,
					},
				},
				yContributionAxis: {
					grid: {
						color: theme.separator,
						drawTicks: false,
					},
					min: 0,
					max: yMax,
					position: "left",
					ticks: {
						callback: (val, index) => {
							return index === 0
								? ""
								: Intl.NumberFormat("en", { notation: "compact" }).format(
									Number(val),
								);
						},
						color: theme.tick,
						count: CONFIG.charts.stats.yAxis.tickCount,
						labelOffset: CONFIG.charts.stats.yAxis.labelOffset,
						mirror: true,
						padding: 9,
						precision: 0,
					},
				},
				yDownloadAxis: {
					grid: {
						color: theme.separator,

						drawTicks: false,
					},
					min: 0,
					position: "right",
					ticks: {
						callback: (val, index) => {
							return index === 0
								? ""
								: Intl.NumberFormat("en", { notation: "compact" }).format(
									Number(val),
								);
						},
						color: theme.tick,
						count: CONFIG.charts.stats.yAxis.tickCount,
						labelOffset: CONFIG.charts.stats.yAxis.labelOffset,
						mirror: true,
						padding: -5,
						precision: 0,
					},
				},
			},
		},
		type: "line",
	});

	return chart.toDataUrl();
}

export async function getLanguagesChartData(
	languages: GitHubLanguages,
	theme: Theme,
) {
	const chart = getNewChart(
		CONFIG.charts.languages.width - CONFIG.charts.languages.wrapperBorder * 2,
		CONFIG.charts.languages.height - CONFIG.charts.languages.wrapperBorder * 2,
		theme.background,
	);

	const distribution = languages.map((language) => language[1]);
	const { backgroundColor, borderColor, legendColor } = getLanguagesColors(
		languages,
		theme,
	);

	chart.setConfig({
		data: {
			datasets: [
				{
					...getNewDataSet(),
					backgroundColor,
					borderColor,
					circumference: 180,
					data: distribution,
				},
			],
			labels: languages.map((language) => language[0]),
		},
		options: {
			plugins: {
				datalabels: {
					display: false,
				},
				legend: {
					display: false,
				},
			},
		},
		type: "doughnut",
	});

	const data = await chart.toDataUrl();

	return { data, legendColor };
}

function getNewChart(width: number, height: number, backgroundColor: string) {
	const chart = new QuickChart();
	chart.setBackgroundColor(backgroundColor);
	chart.setDevicePixelRatio(CONFIG.charts.devicePixelRatio);
	chart.setVersion("3");
	chart.setWidth(width);
	chart.setHeight(height);

	return chart;
}

function getNewDataSet(options: Partial<ChartDataset> = {}) {
	return {
		borderWidth: 1,
		pointRadius: 0,
		tension: CONFIG.charts.tension,
		...options,
	};
}

function isKnownLanguage(
	name: string,
	theme: Theme,
): name is keyof typeof theme.languages.known {
	return name in theme.languages.known;
}

function getLanguagesColors(languages: GitHubLanguages, theme: Theme) {
	const colors: LanguagesColors = {
		backgroundColor: [],
		borderColor: [],
		legendColor: [],
	};
	let unknownColorsCount = 0;

	const unknownList = Array.isArray(theme.languages?.unknown)
		? theme.languages.unknown
		: [];

	for (const [name] of languages) {
		let baseColor: string;

		if (isKnownLanguage(name, theme)) {
			baseColor = theme.languages.known[name];
		} else {
			let unknownBaseColor: string | undefined;

			if (unknownList.length > 0) {
				unknownBaseColor = unknownList[unknownColorsCount % unknownList.length];
			}

			baseColor = unknownBaseColor ?? "#999999";
			unknownColorsCount++;
		}

		const { backgroundColor, borderColor, legendColor } =
			getLanguagesChartColors(baseColor);

		colors.backgroundColor.push(backgroundColor);
		colors.borderColor.push(borderColor);
		colors.legendColor.push(legendColor);
	}

	return colors;
}

export interface Stats {
	gitHub: GitHubContributions;
}

interface LanguagesColors {
	backgroundColor: string[];
	borderColor: string[];
	legendColor: string[];
}
