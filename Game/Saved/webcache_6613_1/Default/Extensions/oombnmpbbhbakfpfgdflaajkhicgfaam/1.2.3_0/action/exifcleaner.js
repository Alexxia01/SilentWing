"use strict";

const exifSwitch = document.getElementById("exif-switch");
const notifSwitch = document.getElementById("notif-switch");
const exifSlider = document.getElementById("exif-slider");
const notifSlider = document.getElementById("notif-slider");
const notifSection = document.getElementById("exif-notif-section");
const restartTooltip = document.getElementById("metadata-tooltip");

const isChrome = /chrome/i.test(navigator.userAgent);
const permissionsToRequest = {
	origins: ["<all_urls>"]
};

const options = {};
chrome.storage.local.get("cfg", (data) => {
	Object.assign(options, data.cfg);
	exifSwitch.checked = Boolean(options.exifClean);
	exifSwitch.checked ? EnableEvents(notifSection) : DisableEvents(notifSection);
	notifSwitch.checked = options.notifications && options.permissions;
	exifSlider.style.display = "block";
	notifSlider.style.display = "block";
	restartTooltip.style.display = options.protectionStatus === ProtectionStatus.RestartRequired ? "flex" : "none";
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
	const cfg = changes.cfg?.newValue;

	if (cfg && namespace === "local") {
		if (cfg.exifClean !== undefined) {
			exifSwitch.checked = Boolean(cfg.exifClean);
			exifSwitch.checked ? EnableEvents(notifSection) : DisableEvents(notifSection);
		}
		if (cfg.protectionStatus) {
			restartTooltip.style.display = cfg.protectionStatus === ProtectionStatus.RestartRequired ? "flex" : "none";
		}
	}
});

function DisableEvents(el) {
	el.style.opacity = "0.5";
	el.style.pointerEvents = "none";
}
function EnableEvents(el) {
	el.style.opacity = "1";
	el.style.pointerEvents = "auto";
}

exifSwitch.addEventListener("change", (event) => {
	event.target.checked ? EnableEvents(notifSection) : DisableEvents(notifSection);

	options.exifClean = event.target.checked;

	chrome.storage.local
		.set({ cfg: options })
		.then(chrome.runtime.sendMessage({ msg: "exif", setting: event.target.checked }));
});

notifSwitch.addEventListener("change", async (event) => {
	if (event.target.checked) {
		chrome.permissions.request(permissionsToRequest).then((granted) => {
			if (!granted) {
				notifSwitch.checked = false;
			}
		});
	}

	const { cfg: config } = await chrome.storage.local.get("cfg");
	config.notifications = event.target.checked;
	chrome.storage.local.set({ cfg: config });

	if (event.target.checked && !isChrome && !config.permissions) {
		setTimeout(() => window.close(), 500);
	}
});
