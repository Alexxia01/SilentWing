// Configuration for the "What's New" page.
//
// updateVersion            — extension versions that trigger showing this page on update
// isFunctionalitySupported — returns true when every feature showcased on this page is available in the user's current environment.
//
// Both fields must return true for the page to be triggered on update.
// Example: "1.2" will display update page for versions 1.2.0, 1.2.1, 1.2.2, etc., but not for 1.3.0 and only when isFunctionalitySupported returns true in the user's current environment.
const whatsNewPageConfig = {
	updateVersion: "1.2",

	isFunctionalitySupported: (cfg) => {
		return cfg.isLlmScanSupported && cfg.isLlmScanEnabled;
	},
};
