import { CONFIG } from "../config";

import { compileTemplate } from "./template";

export function generateReadme() {
	return compileTemplate(
		"README.md",
		"README.md",
		{
			LANGUAGE_CHART_WIDTH:
				CONFIG.charts.languages.width +
				CONFIG.charts.languages.legend.width +
				CONFIG.charts.languages.legend.margin.x +
				CONFIG.charts.languages.wrapperBorder * 2,
			LANGUAGE_CHART_HEIGHT:
				CONFIG.charts.languages.height +
				CONFIG.charts.languages.offset * 2 +
				CONFIG.charts.languages.wrapperBorder,
		},
		".",
	);
}
