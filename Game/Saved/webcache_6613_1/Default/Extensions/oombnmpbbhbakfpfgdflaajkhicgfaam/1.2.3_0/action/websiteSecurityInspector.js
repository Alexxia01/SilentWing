"use strict";

const scanSwitch = document.getElementById("scan-switch");
const slider = document.getElementById("scan-slider");

const isChrome = /chrome/i.test(navigator.userAgent);

const permissionsToRequest = {
	origins: [AllUrls]
};

chrome.storage.local.get("cfg").then(({ cfg: config }) => {
	scanSwitch.checked =
		config.isWebsiteScanEnabled &&
		config.permissions &&
		config.dataCollectionPermissions.browsingActivity &&
		config.dataCollectionPermissions.websiteContent;

	slider.style.display = "block";
});

scanSwitch.addEventListener("change", async (event) => {
	let config;

	if (event.target.checked) {
		chrome.permissions.request(permissionsToRequest).then((granted) => {
			if (!granted) {
				scanSwitch.checked = false;
			}
		});

		config = (await chrome.storage.local.get("cfg")).cfg;

		if (!config.dataCollectionPermissions.browsingActivity || !config.dataCollectionPermissions.websiteContent) {
			chrome.tabs.create({ url: "/action/pages/websiteSecurityInspectorSetup/index.html" });
			chrome.runtime.sendMessage({
				msg: "wsi_page_open"
			});
			window.close();

			return;
		}
	}

	if (!config) {
		config = (await chrome.storage.local.get("cfg")).cfg;
	}

	chrome.storage.local.set({ cfg: { ...config, isWebsiteScanEnabled: event.target.checked } });

	if (event.target.checked && !isChrome && !config.permissions) {
		setTimeout(() => window.close(), 500);
	}
});
