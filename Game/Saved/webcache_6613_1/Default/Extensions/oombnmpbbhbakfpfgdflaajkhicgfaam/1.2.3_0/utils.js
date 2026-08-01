const HelpLinkTopic = {
	main: "idh_config_bps",
	privacyPolicy: "privacy_policy",
	blockedContent: "idh_config_bps_blocked_content",
	eula: "eula",
};

function GetLangCode() {
	const localeCode = chrome.i18n.getUILanguage();

	return LangMap.get(localeCode) || DefaultLang;
}

function GetHelpLink(productType, productVersion, topic = HelpLinkTopic.main) {
	let productCode = ProductCode.SecurityUltimate;

	for (const [key, value] of ProductMap) {
		if (value.name === productType) {
			productCode = key;

			break;
		}
	}

	const helpURL = `https://help.eset.com/getHelp?product=${productCode}&version=${
		productVersion || "latest"
	}&lang=${GetLangCode()}&topic=${topic}`;

	return helpURL;
}

function getDomElementsFromString(htmlString) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, "text/html");

	return Array.from(doc.body.childNodes);
}

async function openSettingsPage() {
	const settingsPageUrl = chrome.runtime.getURL("action/settings.html");
	const [targetTab] = await chrome.tabs.query({ url: settingsPageUrl, currentWindow: true });

	if (targetTab) {
		await chrome.tabs.update(targetTab.id, { active: true });
	} else {
		await chrome.tabs.create({ url: settingsPageUrl });
	}

	window.close();
}
