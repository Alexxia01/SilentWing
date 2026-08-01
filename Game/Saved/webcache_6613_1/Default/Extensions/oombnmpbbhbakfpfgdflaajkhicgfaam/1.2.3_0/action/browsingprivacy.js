"use strict";

const isChrome = /chrome/i.test(navigator.userAgent);

const config = {};

const checkboxMap = {
	browsingHistory: { history: true },
	downloadHistory: { downloads: true },
	cookiesAndSiteData: isChrome
		? { cookies: true, localStorage: true, indexedDB: true, cacheStorage: true }
		: { cookies: true, localStorage: true, indexedDB: true },
	cachedImages: { cache: true },
	passwords: { passwords: true },
	formData: { formData: true },
	serviceWorkers: { serviceWorkers: true },
};
let checkboxOptions = {};

const cleanBtnDiv = document.querySelector(".clean-btn-div");
const cleanBtn = document.querySelector("#clean-btn");
const cleanBtnText = document.querySelector("#clean-btn .btn-text");
const cleanBtnAnimation = document.querySelector("#clean-btn .rotating-circle");

const dataBts = document.querySelectorAll(".data-otr-btn");
const periodSelectForm = document.querySelector("#period-select");

const leftTab = document.querySelector("#left-tab");
const rightTab = document.querySelector("#right-tab");
const leftTabText = document.querySelector("#left-tab-text");
const rightTabText = document.querySelector("#right-tab-text");
const formArContent = document.querySelector("#form-ar-content");
const formOtrContent = document.querySelector("#form-otr-content");
const arContent = document.querySelector("#content-ar");

const btnDiv = document.querySelector(".clean-btn-div");
const dataDescriptionSection = document.querySelector("#data-description-section");

const checkboxes = document.querySelectorAll('input[type=checkbox][name="custom"]');

const customInput = document.querySelector(".custom-input-data");

const arSwitch = document.querySelector("#ar-switch");
const arStatusText = document.querySelector(".ar-status_text");
const arSettingsLink = document.querySelector(".ar-settings-link");

const headerLink = document.querySelector("#popup-subheader-text > span");

const deleteBtnDefaultText = chrome.i18n.getMessage("browsing_one_time_cleanup_delete_btn");
const deleteBtnDeletingText = chrome.i18n.getMessage("browsing_one_time_cleanup_delete_btn_deleting_text");
const deleteBtnDeletedText = chrome.i18n.getMessage("browsing_one_time_cleanup_delete_btn_deleted_text");

chrome.storage.local.get("cfg", (data) => {
	Object.assign(config, data.cfg);
	CreateSelectForm(periodSelectForm, config.histPeriod);
	arSwitch.checked = Boolean(config.autoRemoveOption);
	config.activeTab === 2 ? DisplayTab("right") : DisplayTab("left");
	Object.assign(checkboxOptions, config.customOptions);
	UpdateCheckboxes("custom", checkboxOptions);
	HandleDataConfig(config.datatype);

	if (config.datatype === BrowsingDataType.Private) {
		dataDescriptionSection.style.display = "block";
	}

	if (config.datatype === BrowsingDataType.Custom) {
		document.body.style.height = "600px";
		customInput.style.display = "block";
	}

	if (config.histPeriod === BrowserCleanupPeriod.Unselected) {
		DisableBtnEvents(cleanBtn);
	} else {
		EnableBtnEvents(cleanBtn);
	}

	setArDescriptionContent();

	SelectBtn(dataBts, config.datatype);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName === "local" && changes.cfg && config.nextCleanupTime !== changes.cfg.newValue.nextCleanupTime) {
		config.nextCleanupTime = changes.cfg.newValue.nextCleanupTime;

		setArDescriptionContent();
	}
});

function formatWithLeadingZero(value) {
	return value.toString().length === 1 ? `0${value}` : value;
}

function setArDescriptionContent() {
	if (!config.autoRemoveOption) {
		arStatusText.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_func_disabled");
		arSettingsLink.style.display = "none";
	} else if (!config.nextCleanupTime) {
		arStatusText.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_func_not_set");
		arSettingsLink.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_func_set_up_settings_link");
		arSettingsLink.style.display = "block";
	} else if (config.histArPeriod === BrowserCleanupPeriod.BrowsingSession) {
		arStatusText.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_func_next_session_cleanup");
		arSettingsLink.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_func_change_setting_link");
		arSettingsLink.style.display = "block";
	} else {
		const statusText = chrome.i18n.getMessage("browsing_regular_cleanup_func_next_time_cleanup");
		const nextCleanupTime = new Date(config.nextCleanupTime);
		const mapObj = {
			"%DATE%": `${nextCleanupTime.getDate()}.${nextCleanupTime.getMonth() + 1}.${nextCleanupTime.getFullYear()}`,
			"%TIME%": `${nextCleanupTime.getHours()}:${formatWithLeadingZero(nextCleanupTime.getMinutes())}`,
		};

		arStatusText.innerText = statusText.replace(/%DATE%|%TIME%/gi, (matched) => mapObj[matched]);
		arSettingsLink.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_func_change_setting_link");
		arSettingsLink.style.display = "block";
	}
}

arSettingsLink.addEventListener("click", () => {
	window.location.href = "./regular_cleanup_settings.html";
});

function SelectBtn(btns, value) {
	btns.forEach((btn) => {
		parseInt(btn.value) === value ? btn.classList.add("data-btn-active") : null;
	});
}

function UpdateCheckboxes(checkboxName, checkboxOptions) {
	document.querySelectorAll(`input[name="${checkboxName}"]`).forEach((checkbox) => {
		const mappedProperties = checkboxMap[checkbox.value];
		if (mappedProperties) {
			const isAnyPropertyChecked = Object.keys(mappedProperties).some((property) => checkboxOptions[property]);
			checkbox.checked = isAnyPropertyChecked;
		}
	});
}

function CreateSelectForm(elRef, value = BrowserCleanupPeriod.Unselected) {
	const selElmnt = elRef.getElementsByTagName("select")[0];
	selElmnt.selectedIndex = +value;
	const selItem = document.createElement("div");
	selItem.setAttribute("class", "select-selected");
	selItem.textContent = selElmnt.options[selElmnt.selectedIndex].textContent;
	elRef.appendChild(selItem);
	const optionList = document.createElement("div");
	optionList.setAttribute("class", "select-items select-hide");
	for (let j = 1; j < selElmnt.length; j++) {
		const optionItem = document.createElement("div");
		optionItem.textContent = selElmnt.options[j].textContent;
		optionItem.addEventListener("click", function (e) {
			const selBox = this.parentNode.parentNode.getElementsByTagName("select")[0];
			const prevSibl = this.parentNode.previousSibling;
			for (let i = 0; i < selBox.length; i++) {
				if (selBox.options[i].textContent == this.textContent) {
					selBox.selectedIndex = i;
					prevSibl.textContent = this.textContent;
					const sameEl = this.parentNode.getElementsByClassName("same-as-selected");
					for (let k = 0; k < sameEl.length; k++) {
						sameEl[k].removeAttribute("class");
					}
					this.setAttribute("class", "same-as-selected");
					selBox.dispatchEvent(new window.Event("change"));
					break;
				}
			}
			prevSibl.click();
		});
		optionList.appendChild(optionItem);
	}
	elRef.appendChild(optionList);
	selItem.addEventListener("click", (e) => {
		e.stopPropagation();
		CloseAllSelect(this);
		selItem.nextSibling.classList.toggle("select-hide");
		selItem.classList.toggle("select-arrow-active");
	});
}

function CloseAllSelect(elmnt) {
	let arrNo = [];
	const selItems = document.getElementsByClassName("select-items");
	const selected = document.getElementsByClassName("select-selected");
	for (let i = 0; i < selItems.length; i++) {
		if (elmnt == selected[i] || elmnt === undefined) {
			arrNo.push(i);
		} else {
			selected[i].classList.remove("select-arrow-active");
		}
	}
}

const periodSelect = document.querySelector("#period-selector");
periodSelect.addEventListener("change", (e) => {
	EnableBtnEvents(cleanBtn);
	StoreConfigOptions("histPeriod", parseInt(e.target.value));
});

function SendMessageToBackground(msg, data) {
	chrome.runtime.sendMessage({ msg, data }, (response) => {
		
	});
}

function HandleButtonAction(btn, actionType, btnAnimation, btnText) {
	Promise.resolve()
		.then(() => Delay(200))
		.then(() => {
			btn.classList.remove("cleanup-btn");
			btn.classList.add("cleanup-btn-disabled");
			btnText.classList.add("btn-text-disabled");
			btnAnimation.style.display = "block";
			btnText.innerText = deleteBtnDeletingText;
		})
		.then(() => Delay(1500))
		.then(() => SendMessageToBackground(actionType, config))
		.then(() => {
			btnAnimation.style.display = "none";
			btnText.innerText = deleteBtnDeletedText;
		})
		.then(() => Delay(1000))
		.then(() => {
			btn.classList.remove("cleanup-btn-disabled");
			btn.classList.add("cleanup-btn");
			btnText.classList.remove("btn-text-disabled");
			btnText.innerText = deleteBtnDefaultText;
		});
}

function Delay(duration) {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

cleanBtn.addEventListener("click", () => {
	if (
		((config.datatype === BrowsingDataType.Custom && IsCheckboxChecked(checkboxOptions)) ||
			config.datatype === BrowsingDataType.Private) &&
		config.histPeriod !== BrowserCleanupPeriod.Unselected
	) {
		HandleButtonAction(cleanBtn, "clean", cleanBtnAnimation, cleanBtnText);
	}
});

dataBts.forEach((btn) => {
	btn.addEventListener("click", () => {
		dataBts.forEach((otherBtn) => {
			if (otherBtn !== btn) {
				otherBtn.classList.remove("data-btn-active");
			}
		});
		btn.classList.add("data-btn-active");
		HandleDataConfig(btn.value);
	});
});

function DisplayOptions(val, arTab) {
	let bodyHeight;
	let descriptionDisplay;
	let customInputDisplay;

	switch (val) {
		case BrowsingDataType.Private:
			bodyHeight = "550px";
			descriptionDisplay = "block";
			customInputDisplay = "none";
			break;
		case BrowsingDataType.Custom:
			bodyHeight = "600px";
			descriptionDisplay = "none";
			customInputDisplay = "block";
			break;
		default:
			bodyHeight = "550px";
			descriptionDisplay = "none";
			customInputDisplay = "none";
			break;
	}

	document.body.style.height = bodyHeight;

	if (!arTab) {
		dataDescriptionSection.style.display = descriptionDisplay;
		customInput.style.display = customInputDisplay;
	}
}

function HandleDataConfig(dataTypeVal) {
	const val = parseInt(dataTypeVal);

	DisplayOptions(val, false);
	StoreConfigOptions("datatype", val);
}

function StoreConfigOptions(storageKey, value) {
	config[storageKey] = value;
	chrome.storage.local.set({ cfg: config });
}

function HandleCheckboxChange(checkbox, options, optionKey) {
	checkbox.addEventListener("change", () => {
		const mappedProperties = checkboxMap[checkbox.value];
		if (mappedProperties) {
			if (checkbox.checked) {
				Object.assign(options, mappedProperties);
			} else {
				for (const key in mappedProperties) {
					if (mappedProperties.hasOwnProperty(key)) {
						delete options[key];
					}
				}
			}
			StoreConfigOptions(optionKey, options);
		}
	});
}

checkboxes.forEach((checkbox) => {
	HandleCheckboxChange(checkbox, checkboxOptions, "customOptions");
});

leftTab.addEventListener("click", () => {
	DisplayTab("left");
	DisplayOptions(config.datatype, false);
	StoreConfigOptions("activeTab", 1);
});

rightTab.addEventListener("click", () => {
	DisplayTab("right");
	DisplayOptions(config.datatypeAr, true);
	StoreConfigOptions("activeTab", 2);
});

function DisplayTab(tab) {
	const isLeftTab = tab === "left";
	if (isLeftTab) {
		leftTabText.classList.add("active-tab");
		rightTabText.classList.remove("active-tab");
	} else {
		rightTabText.classList.add("active-tab");
		leftTabText.classList.remove("active-tab");
	}
	formOtrContent.style.display = isLeftTab ? "flex" : "none";
	formArContent.style.display = isLeftTab ? "none" : "flex";
	rightTab.style.borderBottom = isLeftTab ? "0px" : "2px solid #168B8F";
	leftTab.style.borderBottom = isLeftTab ? "2px solid #168B8F" : "0px";
	cleanBtnDiv.style.display = isLeftTab ? "block" : "none";
}

arSwitch.addEventListener("change", (event) => {
	config.autoRemoveOption = event.target.checked;

	if (event.target.checked) {
		window.location.href = "./regular_cleanup_settings.html";
	} else {
		SendMessageToBackground("clean-auto", getBrowserCleanupData(config));

		config.datatypeAr = BrowsingDataType.Unselected;
		config.customArOptions = {};
		config.histArPeriod = BrowserCleanupPeriod.Unselected;
		config.nextCleanupTime = 0;

		setArDescriptionContent();
	}

	chrome.storage.local.set({ cfg: config });
});

function DisableBtnEvents(el) {
	el.classList.remove("cleanup-btn");
	el.disabled = true;
	el.style.pointerEvents = "none";
	el.lastElementChild.classList.add("btn-text-disabled");
	el.classList.add("cleanup-btn-disabled");
}

function EnableBtnEvents(el) {
	el.style.pointerEvents = "auto";
	el.classList.add("cleanup-btn");
	el.disabled = false;
	el.lastElementChild.classList.remove("btn-text-disabled");
	el.classList.remove("cleanup-btn-disabled");
}

headerLink.classList.add("link-text");
headerLink.addEventListener("click", async () => {
	const { cfg } = await chrome.storage.local.get("cfg");

	if (cfg) {
		cfg.settingsTab = 1;

		await chrome.storage.local.set({ cfg });
		await openSettingsPage();
	}
});

function IsCheckboxChecked(obj) {
	return Object.values(obj).some((val) => val);
}

function getBrowserCleanupData(config) {
	return {
		autoRemoveOption: config.autoRemoveOption,
		customArOptions: config.customArOptions,
		datatype: config.datatype,
		datatypeAr: config.datatypeAr,
		histArPeriod: config.histArPeriod,
		histPeriod: config.histPeriod,
		nextCleanupTime: config.nextCleanupTime,
	};
}
