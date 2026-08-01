"use strict";
const isChrome = /chrome/i.test(navigator.userAgent);

if (isChrome) {
	try {
		importScripts("constants.js");
		importScripts("utils.js");
		importScripts("./action/pages/whatsNew/setup.js");
		importScripts("nativemsg.js");
		importScripts("websiteScan.js");
		importScripts("contentScriptInjection.js");
	} catch (e) {
		
	}
}

let m_config = {
	version: 7, // Increment everytime you did any change in m_config,
	profile: "",
	exifClean: false,
	initialized: false,
	searchOption: true,
	cookieSettings: true,
	autoRemoveOption: false,
	excludedCookies: [],
	openTabsCheckbox: true,
	permissions: isChrome,
	productType: "ESET Security",
	productVersion: 0,
	privacyFeatures: "",
	protectionStatus: ProtectionStatus.Protected,
	histPeriod: BrowserCleanupPeriod.Unselected,
	datatype: BrowsingDataType.Unselected,
	histArPeriod: BrowserCleanupPeriod.Unselected,
	datatypeAr: BrowsingDataType.Unselected,
	activeTab: 1,
	settingsTab: 0,
	darkMode: false,
	notifications: false,
	nextCleanupTime: 0,
	isWebsiteScanEnabled: true,
	isWebsiteScanSupported: false,
	isLlmScanEnabled: true,
	isLlmScanSupported: false,
	isLlmScanFirstVisitDone: false,
	updatePageVersion: whatsNewPageConfig.updateVersion,
	dataCollectionPermissions: {
		browsingActivity: isChrome,
		websiteContent: isChrome,
		personalCommunications: isChrome,
	},
};

// Default config for browsing data
let browsingData = {
	history: true,
	downloads: true,
	cookies: true,
	localStorage: true,
	formData: true,
	serviceWorkers: true,
};

if (isChrome) {
	browsingData.cacheStorage = true;
}

m_config.options = browsingData;
m_config.optionsAr = browsingData;
m_config.customOptions = {};
m_config.customArOptions = {};
m_config.msgCount = {
	exifCount: 0,
	searchCount: 0,
	privacyCount: 0,
	blockedPages: 0,
};

let cleanupTimeoutID = 0;
let isProductActive = true;
let isFirstRunAfterInstall = false;

function ConfigUpdate(configVersion, updaterFcn) {
	return { version: configVersion, update: updaterFcn };
}
const configUpdateHistory = [
	ConfigUpdate(1, ConfigUpdate_1_0_5),
	ConfigUpdate(2, ConfigUpdate_1_0_7),
	ConfigUpdate(3, ConfigUpdate_1_0_9),
	ConfigUpdate(4, ConfigUpdate_1_0_10),
	ConfigUpdate(5, ConfigUpdate_1_1_0),
	ConfigUpdate(6, ConfigUpdate_1_1_2),
	ConfigUpdate(7, ConfigUpdate_1_2_0),
];

function ConfigUpdate_1_0_5(prevConfig) {
	prevConfig.datatype = prevConfig.datatype === 1 ? 0 : prevConfig.datatype === 2 ? 1 : prevConfig.datatype;
	prevConfig.datatypeAr = prevConfig.datatypeAr === 1 ? 0 : prevConfig.datatypeAr === 2 ? 1 : prevConfig.datatypeAr;
}

function ConfigUpdate_1_0_7(prevConfig) {
	if (prevConfig.licence === false) {
		prevConfig.protectionStatus = ProtectionStatus.LicenseExpired;
	} else if (prevConfig.status === "restart-required") {
		prevConfig.protectionStatus = ProtectionStatus.RestartRequired;
	} else {
		prevConfig.protectionStatus = ProtectionStatus.Protected;
	}

	delete prevConfig.licence;
	delete prevConfig.status;
	delete prevConfig.connStatus;
}

function ConfigUpdate_1_0_9(prevConfig) {
	prevConfig.options = m_config.options;
	prevConfig.optionsAr = m_config.optionsAr;

	delete prevConfig.customOptionsAr;
}

function ConfigUpdate_1_0_10(prevConfig) {
	if (
		!prevConfig.autoRemoveOption ||
		prevConfig.histArPeriod === BrowserCleanupPeriod.Unselected ||
		(prevConfig.datatypeAr === 1 && !Object.keys(prevConfig.customArOptions).length)
	) {
		prevConfig.datatypeAr = m_config.datatypeAr;
		prevConfig.customArOptions = m_config.customArOptions;
		prevConfig.histArPeriod = m_config.histArPeriod;
	} else {
		prevConfig.datatypeAr = prevConfig.datatypeAr === 1 ? BrowsingDataType.Custom : BrowsingDataType.Private;

		if (prevConfig.histArPeriod === 1) {
			prevConfig.histArPeriod = BrowserCleanupPeriod.Hour;
		}
	}

	prevConfig.datatype = prevConfig.datatype === 1 ? BrowsingDataType.Custom : m_config.datatype;
	prevConfig.nextCleanupTime = m_config.nextCleanupTime;

	delete prevConfig.tempClean;
}

function ConfigUpdate_1_1_0(prevConfig) {
	prevConfig.isWebsiteScanEnabled = m_config.isWebsiteScanEnabled;
	prevConfig.isWebsiteScanSupported = m_config.isWebsiteScanSupported;
	prevConfig.updatePageInfo = [];
	prevConfig.msgCount.blockedPages = 0;
}

function ConfigUpdate_1_1_2(prevConfig) {
	prevConfig.dataCollectionPermissions = m_config.dataCollectionPermissions;

	if (!prevConfig.permissions) {
		prevConfig.searchOption = true;
		prevConfig.cookieSettings = true;
	}

	delete prevConfig.safeSearch;
	delete prevConfig.cleanupSettings;
}

function ConfigUpdate_1_2_0(prevConfig) {
	prevConfig.isLlmScanEnabled = true;
	prevConfig.isLlmScanSupported = false;
	prevConfig.isLlmScanFirstVisitDone = false;
	delete prevConfig.updatePageInfo;
	prevConfig.updatePageVersion = "0.0";
	prevConfig.dataCollectionPermissions.personalCommunications = isChrome;
	prevConfig.productVersion = 0;
}

chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === "install") {
		isFirstRunAfterInstall = true;
	} else if (details.reason === "update") {
		chrome.storage.local.get(["cfg"], (data) => {
			if (!data.cfg) {
				chrome.storage.local.set({ cfg: m_config });
			}
		});
	}
});

function RunUpdate(oldConfig, newConfig) {
	oldConfig.version = oldConfig.version || 0;
	if (oldConfig.version === newConfig.version) {
		return;
	}

	for (const update_increment of configUpdateHistory) {
		if (oldConfig.version < update_increment.version) {
			try {
				update_increment.update(oldConfig);
				oldConfig.version = update_increment.version;
			} catch (error) {
				
				Object.assign(oldConfig, newConfig);
				break;
			}
		}
	}

	oldConfig.version = newConfig.version;
}

InitLocalSettings();

function InitLocalSettings() {
	try {
		chrome.storage.local.get(["cfg"], (data) => {
			if (data && data.cfg) {
				SendNativeMessage("init", { profile: data.cfg.profile });
			} else {
				chrome.storage.local.set({ cfg: m_config }).then(() => {
					SendNativeMessage("init", {});
				});
			}
		});
	} catch (e) {
		
	}
}

chrome.storage.onChanged.addListener(function (changes) {
	const cfg = changes.cfg?.newValue;

	if (!cfg) {
		return;
	}

	switch (cfg.protectionStatus) {
		case ProtectionStatus.LicenseExpired:
			isProductActive = false;
			chrome.action.setPopup({ popup: "./action/alert_expired_license.html" });
			break;
		case ProtectionStatus.ConnectionLost:
			isProductActive = false;
			chrome.action.setPopup({ popup: "./action/alert_connection_lost.html" });
			break;
		case ProtectionStatus.UnsupportedBrowser:
			isProductActive = false;
			chrome.action.setPopup({ popup: "./action/alert_unsupported_browser.html" });
			break;
		case ProtectionStatus.MissingProduct:
			isProductActive = false;
			chrome.action.setPopup({ popup: "./action/alert_missing_product.html" });
			break;
		default:
			isProductActive = true;
			chrome.action.setPopup({ popup: "./action/popup.html" });
			break;
	}
});

chrome.permissions.onAdded.addListener(function (permissions) {
	if (permissions.origins && permissions.origins.includes(AllUrls)) {
		chrome.storage.local.get(["cfg"], (data) => {
			if (data.cfg) {
				data.cfg.permissions = true;
				chrome.storage.local.set({ cfg: data.cfg });
			}
		});
	}
});

chrome.permissions.onRemoved.addListener(function (permissions) {
	if (permissions.origins && permissions.origins.includes(AllUrls)) {
		chrome.storage.local.get(["cfg"], (data) => {
			if (data.cfg) {
				data.cfg.permissions = false;
				chrome.storage.local.set({ cfg: data.cfg });
			}
		});
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => injectContentScript(tabId, tab.url, changeInfo.status));

chrome.tabs.onRemoved.addListener(removeTabStateItem);

function MonitorTab(tabId, url, parentId) {
	
	return false;
}

async function GetExcludedUrls() {
	chrome.storage.local.get(["cfg"], (data) => {
		return data.cfg.excludedCookies || [];
	});
}

function getMsecsByPeriod(histPeriod) {
	const msecsPerHour = 1000 * 60 * 60;

	switch (histPeriod) {
		case BrowserCleanupPeriod.All:
			return 0;
		case BrowserCleanupPeriod.Hour:
			return msecsPerHour;
		case BrowserCleanupPeriod.Day:
			return msecsPerHour * 24;
		case BrowserCleanupPeriod.Week:
			return msecsPerHour * 24 * 7;
		case BrowserCleanupPeriod.Month:
			return msecsPerHour * 24 * 7 * 4;
		default:
			return null;
	}
}

function ParseOrigin(stringUrl) {
	return new URL(stringUrl).origin;
}

function GetOrigins(tabs) {
	let origins = new Set();
	tabs.forEach(function (tab) {
		if (/^((http|https):\/\/)/.test(tab.url)) {
			const origin = ParseOrigin(tab.url);
			origins.add(origin);
		}
	});
	return Array.from(origins);
}

async function GetActiveTabs() {
	return chrome.tabs.query({}).then(GetOrigins);
}

function removeBrowsingData(data, period = 0) {
	const shouldCookiesBeRemoved = data.cookies;
	const dataToRemove = { ...data };

	delete dataToRemove.cookies;
	delete dataToRemove.localStorage;
	delete dataToRemove.indexedDB;

	if (isChrome) {
		delete dataToRemove.cacheStorage;
	}

	chrome.browsingData.remove({ since: period }, dataToRemove);

	if (shouldCookiesBeRemoved) {
		RemoveCookies(period);
	}
}

function AddRemoveProto(hostsArr, addProto) {
	let origins = [];
	hostsArr.forEach(function (hostName) {
		if (addProto) {
			const url = new URL("https://" + hostName);
			origins.push(url.origin);
		} else {
			const url = hostName.replace(/^https?:\/\//, "");
			origins.push(url);
		}
	});
	return origins;
}

async function GetExcludedUrlList() {
	let activeTabs = await GetActiveTabs();
	return chrome.storage.local.get(["cfg"]).then((data) => {
		if (data.cfg.cookieSettings) {
			let excludedUrlList = data.cfg.excludedCookies ? AddRemoveProto(data.cfg.excludedCookies, true) : [];
			if (data.cfg.openTabsCheckbox) {
				excludedUrlList.push(...activeTabs);
			}
			return excludedUrlList;
		}
		return [];
	});
}

async function RemoveCookies(period) {
	const excludedUrlList = await GetExcludedUrlList();
	if (isChrome) {
		let removalOptions = { since: period };
		if (excludedUrlList.length) {
			removalOptions.excludeOrigins = excludedUrlList;
		}
		chrome.browsingData.remove(removalOptions, {
			cookies: true,
			localStorage: true,
			indexedDB: true,
			cacheStorage: true,
		});
	} else {
		if (excludedUrlList.length) {
			await RemoveCookiesExceptDomainsFirefox(excludedUrlList, period);
		} else {
			chrome.browsingData.removeCookies({ since: period });
			chrome.browsingData.remove({}, { localStorage: true, indexedDB: true });
		}
	}
}

async function RemoveCookiesExceptDomainsFirefox(urlList, period) {
	const urlListNoProto = AddRemoveProto(urlList, false);
	const cookieStores = await chrome.cookies.getAllCookieStores();
	for (const store of cookieStores) {
		const cookies = await chrome.cookies.getAll({ storeId: store.id });
		cookies.forEach((cookie) => {
			const cookieDomain =
				cookie.hostOnly === false && cookie.domain.startsWith(".") ? cookie.domain.slice(1) : cookie.domain;
			let shouldDelete = true;
			if (cookie.hostOnly === true) {
				shouldDelete = !urlListNoProto.includes(cookieDomain);
			} else {
				shouldDelete = !urlListNoProto.some(
					(excldedUrl) =>
						excldedUrl.endsWith(cookieDomain) &&
						(excldedUrl == cookieDomain || excldedUrl[excldedUrl.length - 1 - cookieDomain.length] == "."),
				);
			}
			if (shouldDelete) {
				chrome.browsingData.removeCookies({ hostnames: [cookieDomain], since: period });
				chrome.browsingData.remove({ hostnames: [cookieDomain] }, { localStorage: true, indexedDB: true });
			}
		});
	}
}

function planNextTimeCleanup(nextCleanupTime, dataToRemove, cleanupFrequency) {
	let timeoutInterval = nextCleanupTime - new Date().getTime();
	let shouldRemoveData = true;

	if (timeoutInterval < 0) {
		timeoutInterval = 0;
	} else if (timeoutInterval > DelayLimit) {
		timeoutInterval = getMsecsByPeriod(BrowserCleanupPeriod.Week);
		shouldRemoveData = false;
	}

	cleanupTimeoutID = setTimeout(async () => {
		let cleanupTime = nextCleanupTime;

		if (shouldRemoveData) {
			const { cfg: newConfigData } = await chrome.storage.local.get("cfg");
			cleanupTime = new Date().getTime() + cleanupFrequency;
			newConfigData.nextCleanupTime = cleanupTime;

			removeBrowsingData(dataToRemove);
			chrome.storage.local.set({ cfg: newConfigData });
		}

		planNextTimeCleanup(cleanupTime, dataToRemove, cleanupFrequency);
	}, timeoutInterval);
}

async function runAndScheduleRegularCleanup(configChanges) {
	let { cfg: configData } = await chrome.storage.local.get("cfg");

	if (configChanges) {
		configData = { ...configData, ...configChanges };
	}

	if (configData.autoRemoveOption === false) {
		clearTimeout(cleanupTimeoutID);

		return;
	}

	if (
		configData.datatypeAr === BrowsingDataType.Unselected ||
		configData.histArPeriod === BrowserCleanupPeriod.Unselected
	) {
		return;
	}

	let dataToRemove;

	switch (configData.datatypeAr) {
		case BrowsingDataType.Private:
			dataToRemove = configData.optionsAr;
			break;
		case BrowsingDataType.Custom:
			dataToRemove = configData.customArOptions;
			break;
		default:
			break;
	}

	clearTimeout(cleanupTimeoutID);

	if (configData.histArPeriod === BrowserCleanupPeriod.BrowsingSession) {
		if (configData.nextCleanupTime !== 0) {
			removeBrowsingData(dataToRemove);
		}

		chrome.storage.local.set({ cfg: { ...configData, nextCleanupTime: new Date().getTime() } });
	} else {
		const cleanupFrequency = getMsecsByPeriod(configData.histArPeriod);

		await chrome.storage.local.set({ cfg: configData });
		planNextTimeCleanup(configData.nextCleanupTime, dataToRemove, cleanupFrequency);
	}
}

async function processRequest(request, tabId) {
	let response = {};

	switch (request.msg) {
		case "clean-auto":
			runAndScheduleRegularCleanup(request.data);
			break;

		case "clean":
			const removalPeriod =
				request.data.histPeriod === BrowserCleanupPeriod.BrowsingSession
					? performance.timeOrigin
					: new Date().getTime() - getMsecsByPeriod(request.data.histPeriod);

			if (request.data.datatype === BrowsingDataType.Custom) {
				removeBrowsingData(request.data.customOptions, removalPeriod);
			} else if (request.data.datatype === BrowsingDataType.Private) {
				removeBrowsingData(request.data.options, removalPeriod);
			}
			break;

		case "secure-search":
			if (tabId !== InvalidTabId) {
				SendNativeMessage(request.msg, { data: { ...request.data, tabId } });
			}
			break;

		case "website-scan":
			if (tabId !== InvalidTabId) {
				SendNativeMessageEx("website-scan", request.data, {
					tabId,
					url: request.data.tabUrl || request.data.frameUrl,
				});
			}
			break;

		case "llm-scan":
			if (tabId !== InvalidTabId) {
				const { detailId, ...dataToSend } = request.data;

				SendNativeMessageEx("llm-scan", dataToSend, {
					tabId,
					conversationId: request.data.conversationId,
					detailId,
				});
			}
			break;

		case "exif":
			SendNativeMessage("cfg", { data: { exifClean: request.setting } });
			break;

		case "get-site-settings":
			SendNativeMessage(request.msg, {});
			break;

		case "get-active-tabs":
			let activeTabs = await GetActiveTabs();
			chrome.runtime.sendMessage({ type: "active-tabs", urls: activeTabs });
			break;

		case "get-help-link":
			const { cfg: config } = await chrome.storage.local.get("cfg");
			response = GetHelpLink(config.productType, config.productVersion);
			break;

		case "conn-error":
			RestartConnector();
			InitLocalSettings();
			break;

		case "open-gui":
			SendNativeMessage("open-gui", {});
			break;

		case "open_extension_popup":
			chrome.action.openPopup();
			break;

		case "popup_open":
		case "options_open":
		case "tile_ai-conversation-security":
		case "tile_secure-search":
		case "tile_browser-cleanup":
		case "tile_website-security-inspector":
		case "tile_metadata-cleanup":
		case "tile_website-settings-review":
		case "blocking_page_open":
		case "blocking_page_go-back":
		case "blocking_page_ignore":
		case "welcome_page_open":
		case "welcome_page_ask_permissions":
		case "welcome_page_grant_permissions":
		case "whats_new_page_open":
		case "whats_new_ask_permissions":
		case "whats_new_grant_permissions":
		case "wsi_page_open":
		case "wsi_ask_permissions":
		case "wsi_grant_permissions":
		case "data_collection_consent_agree":
		case "data_collection_consent_decline":
			SendNativeMessage("trace", { data: { action: request.msg, ...request.details } });
			break;

		case "log-info":
			SendNativeMessage("log", { data: request.info });
			break;

		default:
			
	}

	return response;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	processRequest(request, sender.tab?.id || InvalidTabId).then((response) => sendResponse(response));
	return true;
});
