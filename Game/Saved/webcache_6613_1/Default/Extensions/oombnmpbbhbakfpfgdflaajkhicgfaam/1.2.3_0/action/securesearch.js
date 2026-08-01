"use strict";

const searchSwitch = document.getElementById("search-switch");
const searchSlider = document.getElementById("search-slider");

const isChrome = /chrome/i.test(navigator.userAgent);

const permissionsToRequest = {
	origins: [AllUrls]
};

chrome.storage.local.get("cfg").then(({ cfg: config }) => {
	searchSwitch.checked = config.searchOption && config.permissions;
	searchSlider.style.display = "block";
});

searchSwitch.addEventListener("change", async (event) => {
	if (event.target.checked) {
		chrome.permissions.request(permissionsToRequest).then((granted) => {
			if (!granted) {
				searchSwitch.checked = false;
			}
		});
	}

	const { cfg: config } = await chrome.storage.local.get("cfg");

	chrome.storage.local.set({ cfg: { ...config, searchOption: event.target.checked } });

	if (event.target.checked && !isChrome && !config.permissions) {
		setTimeout(() => window.close(), 500);
	}
});
