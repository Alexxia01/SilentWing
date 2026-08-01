"use strict";

const scanSwitch = document.getElementById("scan-switch");
const slider = document.getElementById("scan-slider");

const isChrome = /chrome/i.test(navigator.userAgent);

const permissionsToRequest = {
	origins: [AllUrls],
};

chrome.storage.local.get("cfg").then(({ cfg: config }) => {
	scanSwitch.checked =
		config.isLlmScanEnabled &&
		config.isLlmScanSupported &&
		config.permissions &&
		config.dataCollectionPermissions.personalCommunications &&
		config.dataCollectionPermissions.websiteContent;

	slider.style.display = "block";
});

scanSwitch.addEventListener("change", async (event) => {
	if (event.target.checked) {
		chrome.permissions.request(permissionsToRequest).then((granted) => {
			if (!granted) {
				scanSwitch.checked = false;
			}
		});
	}

	const { cfg: config } = await chrome.storage.local.get("cfg");

	chrome.storage.local.set({ cfg: { ...config, isLlmScanEnabled: event.target.checked } });

	if (event.target.checked && !isChrome && !config.permissions) {
		setTimeout(() => window.close(), 500);
	}
});
