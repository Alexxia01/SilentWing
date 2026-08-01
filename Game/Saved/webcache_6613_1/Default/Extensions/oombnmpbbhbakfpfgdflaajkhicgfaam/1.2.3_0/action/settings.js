"use strict";

const cookieForm = document.getElementById("cookie-form");
const removeCookiesBtn = document.getElementById("remove-cookies");
const cookieInput = document.getElementById("cookie-url-input");
const cookieSection = document.getElementById("cookie-section");
const alertSection = document.getElementById("settings-alert-section");
const alertPageHeader = document.querySelector(".alert-header-section p");
const alertPageTextContainer = document.querySelector(".text-center");
const reloadBtn = document.getElementById("reload-btn");
const linkBtn = document.getElementById("link-btn");

const expiredLicenseText = document.querySelector("#expired-license-text");
const connectionLostText = document.querySelector("#connection-lost-text");
const unsupportedBrowserText = document.querySelectorAll(".unsupported-browser-text");
const missingProductText = document.querySelectorAll(".missing-product-text");
const linkBtnSection = document.querySelector("#link-btn-section");
const reloadBtnSection = document.querySelector("#reload-btn-section");

const mainContainer = document.querySelector(".container");
const openTabsCheckbox = document.getElementById("open-tabs-checkbox");
const siteDataSection = document.getElementById("site-data-section");
const appearanceSection = document.getElementById("appearance-section");
const message = document.getElementById("message");
const cookieDetails = document.getElementById("cookie-details");
const cookieList = document.getElementById("cookies-list");
const activeTabsSection = document.getElementById("active-tabs");
const activeTabsDetail = document.getElementById("tabs-detail");
const notifContainer = document.querySelector(".notifications-section");
const locationsContainer = document.querySelector(".locations-section");
const cameraContainer = document.querySelector(".camera-section");
const micContainer = document.querySelector(".microphone-section");

const notifSiteDataEl = document.getElementById("notifications-site-data");
const locSiteDataEl = document.getElementById("locations-site-data");
const cameraSiteDataEl = document.getElementById("camera-site-data");
const micSiteDataEl = document.getElementById("microphone-site-data");

const notifSiteDataHeader = document.querySelector(".notifications-section .section-header");
const locSiteDataHeader = document.querySelector(".locations-section .section-header");
const cameraSiteDataHeader = document.querySelector(".camera-section .section-header");
const micSiteDataHeader = document.querySelector(".microphone-section .section-header");

const notifSiteDataIcon = document.querySelector(".notifications-section svg");
const locSiteDataIcon = document.querySelector(".locations-section svg");
const cameraSiteDataIcon = document.querySelector(".camera-section svg");
const micSiteDataIcon = document.querySelector(".microphone-section svg");

const menuItems = document.querySelectorAll(".menu-item");
const cleanupMenuItem = document.querySelector("#cookie-section-menu-item");
const settingMenuItem = document.querySelector("#site-data-section-menu-item");
const appearanceMenuItem = document.querySelector("#appearance-section-menu-item");
const productInfo = document.querySelectorAll(".product-info");

const activeTabsText = chrome.i18n.getMessage("settings_page_browser_cleanup_active_tabs_text");
const activeTabsLink = chrome.i18n.getMessage("settings_page_browser_cleanup_active_tabs_link");
const allowText = chrome.i18n.getMessage("settings_page_website_settings_allow_text");
const blockText = chrome.i18n.getMessage("settings_page_website_settings_block_text");
const askText = chrome.i18n.getMessage("settings_page_website_settings_ask_text");
const lightModeCheckbox = document.getElementById("light-mode-checkbox");
const darkModeCheckbox = document.getElementById("dark-mode-checkbox");

const addButton = document.getElementById("add-btn");

const cookieOverlay = document.getElementById("cookie-overlay");
const cookieSettingsSwitch = document.getElementById("cookies-switch");

const permissionsToRequest = {
	origins: [AllUrls],
};

const config = {};

let activeTabs = [];

const configSections = [
	{ setting: 1, menuItem: cleanupMenuItem, section: cookieSection },
	{ setting: 2, menuItem: settingMenuItem, section: siteDataSection },
	{ setting: 3, menuItem: appearanceMenuItem, section: appearanceSection },
];

const SitePermissionCode = [SitePermission.Ask, SitePermission.Allow, SitePermission.Block];

function toggleCookieSettingsOverlay(shouldBeDisplayed) {
	cookieOverlay.classList.toggle("cookie-overlay-mask", shouldBeDisplayed);
}

function updateCookieSettingsUI(cookieSettings, permissions) {
	cookieSettingsSwitch.checked = cookieSettings && permissions;

	toggleCookieSettingsOverlay(!cookieSettingsSwitch.checked);
}

function init() {
	chrome.storage.local.get(["cfg"], (data) => {
		Object.assign(config, data.cfg);

		updateCookieSettingsUI(config.cookieSettings, config.permissions);

		if (
			config.protectionStatus === ProtectionStatus.Protected ||
			config.protectionStatus === ProtectionStatus.RestartRequired
		) {
			mainContainer.style.display = "flex";
			DisplaySection(config.settingsTab);
		} else {
			ShowAlertPage(config.protectionStatus);
		}

		if (config.privacyFeatures && config.settingsTab) {
			settingMenuItem.style.display = "flex";
			if (config.settingsTab === 2) {
				chrome.runtime.sendMessage({ msg: "get-site-settings" });
			}
		}

		chrome.runtime.sendMessage({ msg: "get-active-tabs" });

		openTabsCheckbox.checked = config.openTabsCheckbox;

		lightModeCheckbox.checked = !config.darkMode;
		darkModeCheckbox.checked = config.darkMode;

		const cookies = data.cfg.excludedCookies;
		if (cookies && cookies.length) {
			CreateCookieSection(cookies);
		}
	});
}

function DisplaySection(value) {
	const activeSection = configSections.find((section) => section.setting === value);
	if (activeSection) {
		ToggleSection(activeSection);
	}
}

function ToggleSection(activeSection) {
	configSections.forEach((section) => {
		const isActive = section === activeSection;
		section.menuItem.classList.toggle("menu-item-active", isActive);
		section.section.style.display = isActive ? "block" : "none";
	});
}

init();

cookieSettingsSwitch.addEventListener("change", (event) => {
	if (event.target.checked) {
		chrome.permissions.request(permissionsToRequest).then((granted) => {
			if (granted) {
				toggleCookieSettingsOverlay(false);
			} else {
				cookieSettingsSwitch.checked = false;
				toggleCookieSettingsOverlay(true);
			}
		});
	} else {
		toggleCookieSettingsOverlay(true);
	}

	StoreConfigOptions("cookieSettings", event.target.checked);
});

cookieForm.addEventListener("submit", HandleCookieFormSubmit);

cookieInput.addEventListener("input", function () {
	cookieInput.classList.remove("invalid");
	ClearMessage();
});

openTabsCheckbox.addEventListener("change", function () {
	StoreConfigOptions("openTabsCheckbox", this.checked);
});

async function HandleCookieFormSubmit(event) {
	event.preventDefault();
	ClearMessage();
	if (!TestUrl(cookieInput.value)) {
		cookieInput.classList.add("invalid");
		const msg = chrome.i18n.getMessage("settings_page_not_valid_url_warning");
		SetMessage(msg);
		return;
	}
	let url = cookieInput.value;
	const regexp = /^((http|https):\/\/)/;
	if (!regexp.test(url)) {
		url = "http://" + url;
	}
	await StoreUrlHostsToLS(url)
		.then((hostName) => {
			if (hostName) {
				UpdateActiveTabsSection(hostName);
			}
		})
		.then(cookieForm.reset());
}

function TestUrl(str) {
	return /^(((http(s)?):\/\/))?(www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(
		str,
	);
}

function SetMessage(str) {
	message.textContent = str;
	message.hidden = false;
}

function ClearMessage() {
	message.hidden = true;
	message.textContent = "";
}

notifSiteDataHeader.addEventListener("click", () => ToggleSiteDataSection(notifSiteDataEl, notifSiteDataIcon));
locSiteDataHeader.addEventListener("click", () => ToggleSiteDataSection(locSiteDataEl, locSiteDataIcon));
cameraSiteDataHeader.addEventListener("click", () => ToggleSiteDataSection(cameraSiteDataEl, cameraSiteDataIcon));
micSiteDataHeader.addEventListener("click", () => ToggleSiteDataSection(micSiteDataEl, micSiteDataIcon));

chrome.storage.onChanged.addListener(function (changes, area) {
	const oldCfg = changes.cfg?.oldValue;
	const cfg = changes.cfg?.newValue;

	if (!cfg || area !== "local") {
		return;
	}

	if (cfg.privacyFeatures !== undefined) {
		settingMenuItem.style.display = cfg.privacyFeatures ? "flex" : "none";

		if (cfg.privacyFeatures && cfg.settingsTab === 2) {
			chrome.runtime.sendMessage({ msg: "get-site-settings" });
		} else {
			siteDataSection.style.display = "none";
		}
	}

	if (
		config.protectionStatus === ProtectionStatus.Protected ||
		config.protectionStatus === ProtectionStatus.RestartRequired
	) {
		mainContainer.style.display = "block";
		alertSection.style.display = "none";
	} else {
		ShowAlertPage(config.protectionStatus);
	}

	if (cfg.excludedCookies) {
		const cookies = cfg.excludedCookies;
		cookieDetails.textContent = "";
		CreateCookieSection(cookies);
	}

	if (cfg.settingsTab) {
		DisplaySection(cfg.settingsTab);
	}

	if (oldCfg?.permissions !== cfg.permissions) {
		updateCookieSettingsUI(cfg.cookieSettings, cfg.permissions);
	}
});

function ShowAlertPage(protectionStatus) {
	mainContainer.style.display = "none";
	alertSection.style.display = "block";

	switch (protectionStatus) {
		case ProtectionStatus.LicenseExpired:
			alertPageHeader.textContent = chrome.i18n.getMessage("alert_page_expired_license_header");
			linkBtnSection.style.display = "block";
			reloadBtnSection.style.display = "none";
			alertPageTextContainer.classList.remove("multi-paragraph");
			expiredLicenseText.style.display = "block";
			connectionLostText.style.display = "none";
			unsupportedBrowserText.forEach((el) => (el.style.display = "none"));
			missingProductText.forEach((el) => (el.style.display = "none"));
			break;
		case ProtectionStatus.ConnectionLost:
			alertPageHeader.textContent = chrome.i18n.getMessage("alert_page_connection_lost_header");
			linkBtnSection.style.display = "none";
			reloadBtnSection.style.display = "block";
			alertPageTextContainer.classList.remove("multi-paragraph");
			expiredLicenseText.style.display = "none";
			connectionLostText.style.display = "block";
			unsupportedBrowserText.forEach((el) => (el.style.display = "none"));
			missingProductText.forEach((el) => (el.style.display = "none"));
			break;
		case ProtectionStatus.UnsupportedBrowser:
			alertPageHeader.textContent = chrome.i18n.getMessage("alert_page_unsupported_browser_header");
			linkBtnSection.style.display = "none";
			reloadBtnSection.style.display = "none";
			alertPageTextContainer.classList.add("multi-paragraph");
			expiredLicenseText.style.display = "none";
			connectionLostText.style.display = "none";
			unsupportedBrowserText.forEach((el) => (el.style.display = "block"));
			missingProductText.forEach((el) => (el.style.display = "none"));
			break;
		case ProtectionStatus.MissingProduct:
			alertPageHeader.textContent = chrome.i18n.getMessage("alert_page_missing_product_header");
			linkBtnSection.style.display = "none";
			reloadBtnSection.style.display = "none";
			alertPageTextContainer.classList.add("multi-paragraph");
			expiredLicenseText.style.display = "none";
			connectionLostText.style.display = "none";
			unsupportedBrowserText.forEach((el) => (el.style.display = "none"));
			missingProductText.forEach((el) => (el.style.display = "block"));
			break;
		default:
			break;
	}

	document.querySelectorAll(".product-info").forEach((element) => {
		element.textContent = config.productType;
	});

	reloadBtn?.addEventListener("click", function () {
		chrome.runtime.sendMessage({ msg: "conn-error" });
	});

	linkBtn?.addEventListener("click", function () {
		chrome.runtime.sendMessage({ msg: "open-gui" });
	});

	const openHelpLink = () => {
		window.open(GetHelpLink(config.productType, config.productVersion), "_blank");
	};

	document.querySelector(".supported-browsers-link").addEventListener("click", openHelpLink);

	document.querySelector(".online-help-link").addEventListener("click", openHelpLink);
}

function ToggleSiteDataSection(sectionEl, iconEl) {
	sectionEl.classList.toggle("show");
	iconEl.classList.toggle("toggle-icon");
}

chrome.runtime.onMessage.addListener((msg) => {
	if (msg.type === "active-tabs") {
		GetFilteredTabsFromLS(msg.urls).then((urls) => {
			CreateActiveTabsSection(urls);
		});
	}
	if (msg.type === "site-setting") {
		CreatePermissionsSection(msg.user_data);
	}
});

function CreatePermissionsSection(user_data) {
	if (user_data.notifications) {
		notifContainer.style.display = "block";
		CreateSectionUrlList(notifSiteDataEl, "notifications", user_data.notifications);
	}
	if (user_data.geolocation) {
		locationsContainer.style.display = "block";
		CreateSectionUrlList(locSiteDataEl, "location", user_data.geolocation);
	}
	if (user_data.camera) {
		cameraContainer.style.display = "block";
		CreateSectionUrlList(cameraSiteDataEl, "camera", user_data.camera);
	}
	if (user_data.mic) {
		micContainer.style.display = "block";
		CreateSectionUrlList(micSiteDataEl, "microphone", user_data.mic);
	}
}

function GetFilteredTabsFromLS(tabs) {
	return new Promise((resolve) => {
		chrome.storage.local.get("cfg", (data) => {
			let filteredTabs = tabs.filter((tab) => !data.cfg.excludedCookies.includes(GetSubDomain(tab)));
			activeTabs = filteredTabs;
			resolve(filteredTabs);
		});
	});
}

menuItems.forEach(function (item) {
	item.addEventListener("click", function (event) {
		event.preventDefault();

		menuItems.forEach((otherItem) => {
			if (otherItem !== item) {
				otherItem.classList.remove("menu-item-active");
			}
		});
		item.classList.add("menu-item-active");

		const targetContent = document.getElementById(item.getAttribute("data-target"));

		const section = configSections.find((section) => section.section === targetContent);
		StoreConfigOptions("settingsTab", section.setting);

		const contentElements = document.getElementsByClassName("content");
		for (var i = 0; i < contentElements.length; i++) {
			contentElements[i].style.display = "none";
		}
		targetContent.style.display = "block";
	});
});

function StoreConfigOptions(storageKey, value) {
	chrome.storage.local.get("cfg", (data) => {
		data.cfg[storageKey] = value;
		chrome.storage.local.set(data);
	});
}

function GetSubDomain(url) {
	return RemoveWwwSubdomain(GetHostName(url));
}

function UpdateActiveTabsSection(hostName) {
	activeTabs = activeTabs.filter((url) => GetSubDomain(url) !== hostName);
	CreateActiveTabsSection(activeTabs);
}

async function StoreUrlHostsToLS(value) {
	return new Promise((resolve, reject) => {
		const hostName = GetSubDomain(value);
		chrome.storage.local.get(["cfg"], (data) => {
			try {
				if (!data.cfg.excludedCookies.includes(hostName)) {
					data.cfg.excludedCookies.push(hostName);
					chrome.storage.local.set({ cfg: data.cfg }, () => {
						resolve(hostName);
					});
				} else {
					
					resolve(null);
				}
			} catch (err) {
				reject(err);
			}
		});
	});
}

function RemoveWwwSubdomain(url) {
	if (url.startsWith("www.")) {
		return url.substring(4);
	}
	return url;
}

function GetHostName(stringUrl) {
	return new URL(stringUrl).hostname;
}

async function RemoveOriginFromLS(value) {
	chrome.storage.local.get(["cfg"], (data) => {
		try {
			if (data.cfg.excludedCookies.includes(value)) {
				data.cfg.excludedCookies = data.cfg.excludedCookies.filter(function (item) {
					return item !== value;
				});

				chrome.storage.local.set({ cfg: data.cfg }, () => {
					chrome.runtime.sendMessage({ msg: "get-active-tabs" });
				});
			}
		} catch (err) {
			
		}
	});
}

function CreateOrderedList(arr) {
	const ol = document.createElement("ol");
	for (let i of arr) {
		const li = document.createElement("li");
		li.textContent = i;
		ol.appendChild(li);
	}
	return ol;
}

function CreateCookieSection(cookies) {
	cookieList.textContent = "";
	const ul = CreateSectionList(cookies, CreateWhitelistRemoveBtn);
	cookieList.appendChild(ul);
	cookieDetails.appendChild(cookieList);
}

function CreateActiveTabsSection(activeTabs) {
	activeTabsSection.textContent = "";
	const heading = document.createElement("p");
	getDomElementsFromString(activeTabsText).forEach((element) => {
		heading.appendChild(element);
	});
	activeTabsSection.appendChild(heading);
	const refreshLink = heading.querySelector("span");
	refreshLink.setAttribute("id", "refresh-link");
	refreshLink.addEventListener("click", function () {
		chrome.runtime.sendMessage({ msg: "get-active-tabs" });
	});

	const ol = CreateSectionList(activeTabs, CreateWhitelistBth);
	activeTabsDetail.textContent = "";
	activeTabsDetail.appendChild(ol);
	activeTabsSection.appendChild(activeTabsDetail);
}

function CreateSectionList(dataArr, fn) {
	const list = document.createElement("ul");

	for (const url of dataArr) {
		const li = document.createElement("li");
		const detailDiv = document.createElement("div");
		detailDiv.className = "site-detail";

		const urlDetail = document.createElement("div");
		urlDetail.className = "url-detail";
		urlDetail.innerText = url;

		const urlTooltip = new UrlTooltip({
			child: urlDetail,
			url,
			className: "browser-cleanup-page_url-tooltip",
		});
		detailDiv.appendChild(urlTooltip.node);

		const btn = fn(url);
		detailDiv.appendChild(btn);
		li.appendChild(detailDiv);
		list.appendChild(li);
	}

	return list;
}

async function CreateSectionUrlList(parentEl, type, obj) {
	const dataArr = Object.keys(obj);
	const urlListElement = document.createElement("ul");
	urlListElement.classList.add("site-settings__url-list");

	parentEl.textContent = "";

	for (let i = 0; i < dataArr.length; i++) {
		const urlListItemElement = document.createElement("li");
		urlListItemElement.classList.add("site-settings__url-list-item");

		const url = dataArr[i];
		const initialValue = SitePermissionCode[obj[url]];

		const siteSettingsReviewItem = new SiteSettingsReviewItem({ type, url, initialValue });
		urlListItemElement.appendChild(siteSettingsReviewItem.node);

		urlListElement.appendChild(urlListItemElement);
	}

	parentEl.appendChild(urlListElement);
}

function CreateWhitelistBth(url) {
	const whiteListBtn = document.createElement("div");
	const imageEl = document.createElement("img");
	imageEl.src = "./assets/plus_icon.svg";
	imageEl.alt = chrome.i18n.getMessage("settings_page_browser_cleanup_plus_img_alt");
	whiteListBtn.appendChild(imageEl);
	whiteListBtn.onclick = () => {
		StoreUrlHostsToLS(url).then((hostName) => {
			if (hostName) {
				UpdateActiveTabsSection(hostName);
			}
		});
	};
	return whiteListBtn;
}

function CreateWhitelistRemoveBtn(url) {
	const removeBtn = document.createElement("div");
	const imageEl = document.createElement("img");
	imageEl.src = "./assets/minus_icon.svg";
	imageEl.alt = chrome.i18n.getMessage("settings_page_browser_cleanup_minus_img_alt");
	removeBtn.appendChild(imageEl);
	removeBtn.onclick = () => {
		RemoveOriginFromLS(url);
	};
	return removeBtn;
}

lightModeCheckbox.addEventListener("change", function () {
	if (darkModeCheckbox.checked) {
		lightModeCheckbox.checked = true;
		darkModeCheckbox.checked = false;
		StoreConfigOptions("darkMode", false);
		localStorage.setItem("isDarkMode", false);
	} else {
		lightModeCheckbox.checked = true;
	}
});

darkModeCheckbox.addEventListener("change", function () {
	if (lightModeCheckbox.checked) {
		darkModeCheckbox.checked = true;
		lightModeCheckbox.checked = false;
		StoreConfigOptions("darkMode", true);
		localStorage.setItem("isDarkMode", true);
	} else {
		darkModeCheckbox.checked = true;
	}
});
