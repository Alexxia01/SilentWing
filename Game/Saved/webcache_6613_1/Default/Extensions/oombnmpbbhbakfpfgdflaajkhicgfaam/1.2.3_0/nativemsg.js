"use strict";

const NATIVE_APP = "com.eset.browserprivacyandsecurity";
const MissingProductErrorsList = [
	"Specified native messaging host not found.",
	`No such native application ${NATIVE_APP}`,
];
let g_connector = null;
let exifMsgCounter = 0;
let exifMsgResetTimer;
let connectError = false;
let lastError;
const msgStorage = new Map();

function NativeMsgListener(msg) {
	
	if (!(msg instanceof Object)) {
		lastError = `Invalid message format: ${JSON.stringify(msg)}`;
	} else if (msg.log) {
		
	} else if (msg.connect === "error") {
		ShowAlertPopup(ProtectionStatus.ConnectionLost);
		if (!connectError) {
			g_connector.disconnect();
			g_connector = null;
			connectError = true;
			InitLocalSettings();
		}
	} else {
		ProcessMessage(msg).then((replyDetail) => {
			FinishRequest(msg?.msgId || 0, replyDetail);
		});
	}

	if (lastError) {
		FinishRequest(0, lastError);
		lastError = "";
	}
}

async function openWelcomePage() {
	if (!isFirstRunAfterInstall) {
		return;
	}

	const { cfg } = await chrome.storage.local.get("cfg");

	if (!cfg || cfg.protectionStatus !== ProtectionStatus.Protected) {
		return;
	}

	chrome.tabs.create({
		url: "/action/pages/welcome/index.html",
	});

	SendNativeMessage("trace", {
		data: { action: "welcome_page_open", granted_permissions: cfg.permissions },
	});

	isFirstRunAfterInstall = false;
}

async function ProcessMessage(msg) {
	let reply = null;

	if (msg.cmd) {
		const msgStorageItem = PopMsgStorageItem(msg.msgId);
		if (msg.cmd === "init") {
			connectError = false;
			reply = await UpdateSettings(msg.settings, msg?.profile);

			await showWhatsNewPage();
			ShowAlertPopup(reply.protectionStatus);
			await openWelcomePage();
			runAndScheduleRegularCleanup(null);
		} else if (msg.cmd === "secure-search" && msg.tabId) {
			chrome.tabs.sendMessage(msg.tabId, { payload: msg }, () => {
				
			});
		} else if (msg.cmd === "uninstall") {
			chrome.management.uninstallSelf();
		} else if (msg.cmd === "get-site-settings") {
			if (msg.user_data && isChrome) {
				chrome.runtime.sendMessage({ type: "site-setting", user_data: msg.user_data });
			}
		} else if (msg.cmd === "website-scan" && msgStorageItem.tabId) {
			if (msg.status === WebsiteScanStatus.Block) {
				const { tabId, url: storedTabUrl } = msgStorageItem;
				const storedTabUrlHost = new URL(storedTabUrl).host;

				try {
					const { url: currentTabUrl } = await chrome.tabs.get(tabId);
					const { cfg: config, [StorageKey.WebsiteScanBlockList]: blockList = {} } = await chrome.storage.local.get([
						"cfg",
						StorageKey.WebsiteScanBlockList,
					]);

					chrome.storage.local.set({ [StorageKey.WebsiteScanBlockList]: { ...blockList, [msg.msgId]: storedTabUrl } });

					if (
						(storedTabUrlHost && new URL(currentTabUrl).host === storedTabUrlHost) ||
						currentTabUrl === storedTabUrl
					) {
						config.msgCount.blockedPages += 1;
						chrome.storage.local.set({ cfg: config });

						chrome.tabs.sendMessage(msgStorageItem.tabId, { cmd: msg.cmd, block: true, msgId: msg.msgId });
					}
				} catch (error) {
					
				}
			}
		} else if (msg.cmd === "llm-scan") {
			const { tabId, conversationId, detailId } = msgStorageItem;

			chrome.tabs.sendMessage(tabId, {
				cmd: msg.cmd,
				data: { conversationId, detailId, detections: msg.detections },
			});
		}
	} else if (msg.settings) {
		reply = await UpdateSettings(msg.settings, msg?.profile);

		showWhatsNewPage();
	} else if (msg.notification?.metadata_cleanup) {
		chrome.storage.local.get(["cfg"], (data) => {
			if (data.cfg.notifications) {
				exifMsgCounter++;
				PushNotification(exifMsgCounter);
			}
		});
	}

	return reply;
}

function FinishRequest(msgId, detail) {
	if (detail) {
		SendNativeMessage("log", { data: { msgId: msgId, detail: JSON.stringify(detail) } });
	}
}

function shouldShowWhatsNewPage(cfg) {
	if (cfg.updatePageVersion === whatsNewPageConfig.updateVersion) {
		return false;
	}

	const extVersion = chrome.runtime
		.getManifest()
		.version.split(".")
		.map((num) => parseInt(num));
	const updateVersion = whatsNewPageConfig.updateVersion.split(".").map((num) => parseInt(num));

	for (let i = 0; i < Math.min(extVersion.length, updateVersion.length); i++) {
		if ((extVersion[i] || 0) !== (updateVersion[i] || 0)) {
			return false;
		}
	}

	if (!whatsNewPageConfig.isFunctionalitySupported(cfg)) {
		return false;
	}

	return true;
}

async function showWhatsNewPage() {
	const { cfg } = await chrome.storage.local.get("cfg");
	const shouldUpdatePageBeShown = shouldShowWhatsNewPage(cfg);

	if (!shouldUpdatePageBeShown) {
		return;
	}

	cfg.updatePageVersion = whatsNewPageConfig.updateVersion;

	await chrome.storage.local.set({ cfg: cfg });

	await chrome.tabs.create({
		url: "/action/pages/whatsNew/index.html",
	});

	SendNativeMessage("trace", {
		data: { action: "whats_new_page_open", granted_permissions: cfg.permissions },
	});
}

function UpdateSettings(settings, profile = null) {
	return new Promise((resolve) => {
		chrome.storage.local.get(["cfg"], async (data) => {
			RunUpdate(data.cfg, m_config);

			data.cfg.initialized = true;
			data.cfg.exifClean = settings.exif;
			data.cfg.productVersion = settings.productVersion;
			data.cfg.productType = ProductMap.get(settings.product).name;
			data.cfg.privacyFeatures = ProductMap.get(settings.product).privacy;
			data.cfg.isWebsiteScanSupported = settings.isWebsiteScanSupported;
			data.cfg.isLlmScanSupported = settings.isLlmScanSupported;

			if (settings.protectionStatus) {
				data.cfg.protectionStatus = settings.protectionStatus;
			} else if (settings.licence === false) {
				data.cfg.protectionStatus = ProtectionStatus.LicenseExpired;
			} else if (settings.status === "restart-required") {
				data.cfg.protectionStatus = ProtectionStatus.RestartRequired;
			} else {
				data.cfg.protectionStatus = ProtectionStatus.Protected;
			}

			if (profile) {
				data.cfg.profile = profile;
			}

			const permissionOrigin = await chrome.permissions.contains({
				origins: [AllUrls],
			});

			data.cfg.permissions = permissionOrigin;

			await chrome.storage.local.set({ cfg: data.cfg });

			resolve(data.cfg);
		});
	});
}

function ResetCounter() {
	exifMsgCounter = 0;
	chrome.storage.local.get(["cfg"], (data) => {
		data.cfg.msgCount.exifCount = exifMsgCounter;
		chrome.storage.local.set({ cfg: data.cfg });
	});
}

function PushNotification(count) {
	clearTimeout(exifMsgResetTimer);

	const UpdateCounter = () => {
		return new Promise((resolve) => {
			chrome.storage.local.get(["cfg"], (data) => {
				data.cfg.msgCount.exifCount = count;
				chrome.storage.local.set({ cfg: data.cfg }, () => {
					resolve();
				});
			});
		});
	};

	UpdateCounter().then(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ["notifications.js"] });
		});

		exifMsgResetTimer = setTimeout(ResetCounter, 10000);
	});
}

function SendNativeMessageEx(cmd, dataToSend = {}, dataToStore = {}) {
	const nativemsg = {
		cmd: cmd,
		msgId: GenerateMessageId(),
	};

	msgStorage.set(nativemsg.msgId, dataToStore);

	if (Object.keys(dataToSend).length) {
		nativemsg.data = dataToSend;
	}

	
	GetConnector()?.postMessage(nativemsg);
}

function SendNativeMessage(cmd, { profile = null, tabId = InvalidTabId, data = null }) {
	let nativemsg = {
		cmd: cmd,
		msgId: GenerateMessageId(),
	};

	if (profile !== null && profile.length) {
		nativemsg.profile = profile;
	}

	if (tabId !== InvalidTabId) {
		nativemsg.tabId = tabId;
	}

	if (data !== null) {
		nativemsg.data = data;
	}

	
	GetConnector()?.postMessage(nativemsg);
}

function GenerateMessageId() {
	let msgId = 0;
	do {
		msgId = Math.floor(Math.random() * Math.pow(2, 30));
	} while (msgStorage.has(msgId));
	return msgId;
}

function PopMsgStorageItem(msgId) {
	if (msgId) {
		const msgStorageItem = msgStorage.get(msgId) || {};
		msgStorage.delete(msgId);
		return msgStorageItem;
	}
	return {};
}

function NativeDisconnect(onDisconnectArg) {
	
	if (chrome.runtime.lastError) {
		lastError = chrome.runtime.lastError.message;
	} else if (onDisconnectArg && onDisconnectArg.error.message) {
		lastError = onDisconnectArg.error.message;
	}

	g_connector = null;

	if (MissingProductErrorsList.includes(lastError)) {
		ShowAlertPopup(ProtectionStatus.MissingProduct);
	} else {
		ShowAlertPopup(ProtectionStatus.ConnectionLost);
	}
}

function ShowAlertPopup(alertCode) {
	let isAlert = true;

	switch (alertCode) {
		case ProtectionStatus.LicenseExpired:
			chrome.action.setPopup({ popup: "./action/alert_expired_license.html" });
			break;
		case ProtectionStatus.ConnectionLost:
			chrome.action.setPopup({ popup: "./action/alert_connection_lost.html" });
			break;
		case ProtectionStatus.UnsupportedBrowser:
			chrome.action.setPopup({ popup: "./action/alert_unsupported_browser.html" });
			break;
		case ProtectionStatus.MissingProduct:
			chrome.action.setPopup({ popup: "./action/alert_missing_product.html" });
			break;
		default:
			isAlert = false;
			break;
	}

	if (!isAlert) {
		isProductActive = true;
		return;
	}

	isProductActive = false;

	chrome.storage.local.get(["cfg"], (data) => {
		data.cfg.protectionStatus = alertCode;
		chrome.storage.local.set({ cfg: data.cfg });
	});
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

function GetConnector() {
	if (!g_connector) {
		try {
			g_connector = chrome.runtime.connectNative(NATIVE_APP);
			g_connector.onMessage.addListener(NativeMsgListener);
			g_connector.onDisconnect.addListener(NativeDisconnect);
		} catch (e) {
			ShowAlertPopup(ProtectionStatus.ConnectionLost);
			
			lastError = e.message;
			g_connector = null;
		}
	}

	return g_connector;
}

function RestartConnector() {
	if (g_connector) {
		g_connector.disconnect();
		g_connector = null;
	}
}
