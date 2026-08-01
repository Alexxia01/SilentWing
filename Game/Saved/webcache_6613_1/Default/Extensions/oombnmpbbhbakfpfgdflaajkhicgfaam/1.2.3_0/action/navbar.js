"use strict";

CreateMenuIcon();

const menuBox = document.querySelector(".menu-box");
const menuIcon = document.querySelector("#toggle-icon");
const overviewMenuBtn = document.querySelector("#overview-settings-btn");
const settingsMenuBtn = document.querySelector("#menu-settings-btn");
const helpMenuBtn = document.querySelector("#help-settings-btn");
const menuOverlay = document.getElementById("overlay");
const menuCfg = {};

chrome.storage.local.get("cfg", (data) => {
	Object.assign(menuCfg, data.cfg);
});

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

menuIcon.addEventListener("click", function () {
	ShowMenu();
});

function ShowMenu() {
	if (document.documentElement.dir === "rtl") {
		menuBox.style.width = "350px";
		menuBox.style.right = 0;
	} else {
		menuBox.style.width = "350px";
		menuBox.style.left = 0;
	}
	menuOverlay.style.display = "block";
	gridItems.forEach(function (el) {
		el.style.pointerEvents = "none";
	});
}

function HideMenu() {
	menuBox.style.width = 0;
	menuOverlay.style.display = "none";
	sleep(500).then(() => {
		gridItems.forEach(function (el) {
			el.style.pointerEvents = "auto";
		});
	});
}

function CreateMenuIcon() {
	const headerIcon = document.querySelector(".header-icon");
	const toggleIcon = document.createElement("div");
	toggleIcon.setAttribute("id", "toggle-icon");
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("class", "hamburger-menu-icon");
	const useElement = document.createElementNS("http://www.w3.org/2000/svg", "use");
	useElement.setAttribute("href", "#hamburger-menu-icon");
	svg.appendChild(useElement);
	toggleIcon.appendChild(svg);
	headerIcon.prepend(toggleIcon);
}

settingsMenuBtn.addEventListener("click", async () => {
	chrome.runtime.sendMessage({ msg: "options_open" });

	const { cfg } = await chrome.storage.local.get("cfg");

	if (cfg) {
		cfg.settingsTab = 1;

		await chrome.storage.local.set({ cfg });
		await openSettingsPage();
	}
});

overviewMenuBtn.addEventListener("click", function () {
	HideMenu();
});

helpMenuBtn.addEventListener("click", function () {
	const helpURL = GetHelpLink(menuCfg.productType, menuCfg.productVersion);

	window.open(helpURL, "_blank");
});

menuOverlay.addEventListener("click", function () {
	HideMenu();
});
