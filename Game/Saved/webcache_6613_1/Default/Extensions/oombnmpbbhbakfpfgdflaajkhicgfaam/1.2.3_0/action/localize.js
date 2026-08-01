"use strict";

function localizeHtml() {
	if (chrome.i18n.getMessage("direction") === "rtl") {
		document.documentElement.dir = "rtl";
	}

	const titleElement = document.querySelector("title");
	document.title = chrome.i18n.getMessage(titleElement.innerText);

	const i18nElements = document.querySelectorAll(".localizable");

	i18nElements.forEach((element) => {
		const innerTextKey = element.dataset.i18n;
		const altTextKey = element.dataset.i18nAlt;
		const placeholderKey = element.dataset.i18nPlaceholder;

		if (innerTextKey) {
			getDomElementsFromString(chrome.i18n.getMessage(innerTextKey)).forEach((parsedElement) => {
				element.appendChild(parsedElement);
			});
		}

		if (altTextKey) {
			element.alt = chrome.i18n.getMessage(altTextKey);
		}

		if (placeholderKey) {
			element.placeholder = chrome.i18n.getMessage(placeholderKey);
		}
	});
}

localizeHtml();
