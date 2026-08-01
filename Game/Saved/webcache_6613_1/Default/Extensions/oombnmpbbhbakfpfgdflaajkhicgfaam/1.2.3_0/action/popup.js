"use strict";

const secureSearchBtn = document.querySelector(".secure-search-btn");
const aiConversationSecurityBtn = document.querySelector(".ai-conversation-security-btn");
const aiConversationSecurityIcon = document.querySelector(".ai-conversation-security-icon");
const secureSearchIcon = document.querySelector(".secure-search-icon");
const websiteSecurityInspectorSetupBtn = document.querySelector(".website-security-inspector-setup-btn");
const websiteSecurityInspectorIcon = document.querySelector(".website-security-inspector-icon");
const aiConversationSecurityPopupTile = document.getElementById("ai-conversation-security-popup-tile");
const browserCleanupPopupTile = document.getElementById("browser-cleanup-popup-tile");
const websiteSecurityInspectorPopupTile = document.getElementById("website-security-inspector-popup-tile");
const secureSearchPopupTile = document.getElementById("secure-search-popup-tile");
const websiteSettingPopupTile = document.getElementById("website-setting-popup-tile");
const metadataCleanupPopupTile = document.getElementById("metadata-cleanup-popup-tile");
const featuresSection = document.getElementById("features-section");
const metadataBtn = document.getElementById("metadata-btn");
const restartIcon = document.getElementById("metadata-icon");
const metadataIcon = document.querySelector(".metadata-cleanup-icon");
const protectedBanner = document.querySelector(".ok-banner");
const restartBanner = document.querySelector(".restart-banner");
const privacyPolicyLink = document.querySelector(".privacy-policy-link");
const eulaLink = document.querySelector(".eula-link");
const versionSpan = document.getElementById("version_no");

chrome.runtime.sendMessage({ msg: "popup_open" });

chrome.storage.local.get(["cfg"], (data) => {
	if (data && data.cfg && data.cfg.initialized) {
		HideLoadingPage();
		LoadPopupFeatures(data.cfg);
		setHelpLinks(data.cfg);
	} else {
		ShowLoadingPage();
	}
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
	if (
		changes.cfg?.newValue.privacyFeatures === false ||
		(changes.cfg?.newValue.privacyFeatures === true && namespace === "local")
	) {
		displayFeaturesSection(changes.cfg.newValue);
	}

	if (changes.cfg?.newValue.initialized) {
		HideLoadingPage();
		LoadPopupFeatures(changes.cfg.newValue);
	}

	if (changes.cfg?.newValue.protectionStatus) {
		DisplayRestartRequired(changes.cfg.newValue);
	}

	if (changes.cfg?.newValue.exifClean !== undefined) {
		UpdateExifCleanTile(changes.cfg.newValue);
	}

	if (changes.cfg?.newValue.productType !== changes.cfg?.oldValue.productType) {
		setHelpLinks(changes.cfg.newValue);
	}
});

function setVisible(element, condition) {
	element.style.display = condition ? "block" : "none";
}

function displayFeaturesSection(config) {
	const { isLlmScanSupported, isWebsiteScanSupported, productType } = config;
	const eis = ProductMap.get(ProductCode.InternetSecurity).name;
	const essp = ProductMap.get(ProductCode.SmartSecurityPremium).name;

	setVisible(websiteSecurityInspectorPopupTile, isWebsiteScanSupported);
	setVisible(aiConversationSecurityPopupTile, isLlmScanSupported);

	if (productType === essp || productType === eis) {
		setVisible(websiteSettingPopupTile, false);
		setVisible(metadataCleanupPopupTile, false);

		if (productType === eis) {
			setVisible(aiConversationSecurityPopupTile, false);
		}

		if (productType === eis || (productType === essp && (!isLlmScanSupported || !isWebsiteScanSupported))) {
			featuresSection.classList.add("features-section-flex-view");

			secureSearchPopupTile.classList.add("rows-2-grid");
			browserCleanupPopupTile.classList.add("rows-2-grid");

			if (isLlmScanSupported && !isWebsiteScanSupported) {
				aiConversationSecurityPopupTile.classList.add("rows-2-grid");
			}

			if (!isLlmScanSupported && isWebsiteScanSupported) {
				websiteSecurityInspectorPopupTile.classList.add("rows-2-grid");
			}

			if (productType === eis && isWebsiteScanSupported) {
				websiteSecurityInspectorPopupTile.classList.add("rows-2-grid");
			}
		}

		if (!isWebsiteScanSupported && (!isLlmScanSupported || productType === eis)) {
			featuresSection.classList.add("two-tiles-flex-style");
		}

		if (productType === essp && isLlmScanSupported && isWebsiteScanSupported) {
			featuresSection.classList.add("four-tiles-grid-style");
		}
	} else {
		if (!isLlmScanSupported && !isWebsiteScanSupported) {
			featuresSection.classList.add("two-tiles-flex-style");
		}
	}
}

function DisplayRestartRequired(config) {
	if (config.protectionStatus === ProtectionStatus.RestartRequired) {
		restartBanner.style.display = "block";
		protectedBanner.style.display = "none";
		restartIcon.style.display = "block";
		metadataBtn.style.display = "none";
	} else if (config.protectionStatus === ProtectionStatus.Protected && config.exifClean === false) {
		restartBanner.style.display = "none";
		protectedBanner.style.display = "block";
		restartIcon.style.display = "none";
		metadataBtn.style.display = "block";
	} else {
		restartBanner.style.display = "none";
		protectedBanner.style.display = "block";
		restartIcon.style.display = "none";
	}
}

function HideLoadingPage() {
	document.querySelector(".loading-container").style.display = "none";
	document.querySelector(".main-container").style.display = "block";
}

function ShowLoadingPage() {
	document.querySelector(".loading-container").style.display = "block";
	document.querySelector(".main-container").style.display = "none";
}

function UpdateExifCleanTile(config) {
	if (config.exifClean) {
		metadataBtn.style.display = "none";
		metadataIcon.classList.add("metadata-icon-active");
	} else {
		if (config.protectionStatus === ProtectionStatus.RestartRequired) {
			metadataBtn.style.display = "none";
		} else {
			metadataBtn.style.display = "block";
		}
		metadataIcon.classList.remove("metadata-icon-active");
	}
}

function setHelpLinks(data) {
	privacyPolicyLink.href = GetHelpLink(data.productType, data.productVersion, HelpLinkTopic.privacyPolicy);
	eulaLink.href = GetHelpLink(data.productType, data.productVersion, HelpLinkTopic.eula);
}

function LoadPopupFeatures(data) {
	DisplayRestartRequired(data);
	displayFeaturesSection(data);
	UpdateExifCleanTile(data);

	if (data.searchOption && data.permissions) {
		secureSearchBtn.style.display = "none";
		secureSearchIcon.classList.add("search-icon-active");
	} else {
		secureSearchBtn.style.display = "block";
		secureSearchIcon.classList.remove("search-icon-active");
	}

	if (
		data.isLlmScanEnabled &&
		data.isLlmScanSupported &&
		data.permissions &&
		data.dataCollectionPermissions.personalCommunications &&
		data.dataCollectionPermissions.websiteContent
	) {
		aiConversationSecurityBtn.style.display = "none";
		aiConversationSecurityIcon.classList.add("ai-conversation-security-icon-active");
	} else {
		aiConversationSecurityBtn.style.display = "block";
		aiConversationSecurityIcon.classList.remove("ai-conversation-security-icon-active");
	}

	if (
		data.permissions &&
		data.dataCollectionPermissions.browsingActivity &&
		data.dataCollectionPermissions.websiteContent &&
		data.isWebsiteScanEnabled
	) {
		websiteSecurityInspectorSetupBtn.style.display = "none";
		websiteSecurityInspectorIcon.classList.add("website-security-inspector-active");
	} else {
		websiteSecurityInspectorSetupBtn.style.display = "block";
		websiteSecurityInspectorIcon.classList.remove("website-security-inspector-active");
	}
}

aiConversationSecurityPopupTile.addEventListener("click", () => {
	chrome.runtime.sendMessage({ msg: "tile_ai-conversation-security" });
	window.location.href = "./aiConversationSecurity.html";
});

secureSearchPopupTile.addEventListener("click", () => {
	chrome.runtime.sendMessage({ msg: "tile_secure-search" });
	window.location.href = "./securesearch.html";
});

browserCleanupPopupTile.addEventListener("click", () => {
	chrome.runtime.sendMessage({ msg: "tile_browser-cleanup" });
	window.location.href = "./browsingprivacy.html";
});

websiteSecurityInspectorPopupTile.addEventListener("click", () => {
	chrome.runtime.sendMessage({ msg: "tile_website-security-inspector" });
	window.location.href = "./websiteSecurityInspector.html";
});

metadataCleanupPopupTile.addEventListener("click", () => {
	chrome.runtime.sendMessage({ msg: "tile_metadata-cleanup" });
	window.location.href = "./exifcleaner.html";
});

websiteSettingPopupTile.addEventListener("click", async () => {
	chrome.runtime.sendMessage({ msg: "tile_website-settings-review" });

	const { cfg } = await chrome.storage.local.get("cfg");

	if (cfg) {
		cfg.settingsTab = 2;

		await chrome.storage.local.set({ cfg });
		await openSettingsPage();
	}
});

const gridItems = document.querySelectorAll(".item-hover");
gridItems.forEach((item) => {
	const icon = item.querySelector(".fl-icon > svg");
	const heading = item.querySelector(".fr-heading-text");
	const text = item.querySelector(".fr-text");
	item.addEventListener("mouseenter", () => {
		item.classList.add("item-hovered");
		icon.classList.add("icon-hovered");
		heading.classList.add("hide-on-hover");
		text.classList.add("show-on-hover");
	});
	item.addEventListener("mouseleave", () => {
		item.classList.remove("item-hovered");
		icon.classList.remove("icon-hovered");
		heading.classList.remove("hide-on-hover");
		text.classList.remove("show-on-hover");
	});
});

versionSpan.textContent = chrome.runtime.getManifest().version;
