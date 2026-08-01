const Browser = {
	Unknown: 0,
	Chrome: 1,
	Firefox: 2,
	Edge: 3,
	Brave: 4
};

async function detectBrowser() {
	const userAgent = navigator.userAgent;

	if (userAgent.includes("Firefox")) {
		return Browser.Firefox;
	}

	if (userAgent.includes("Edg")) {
		return Browser.Edge;
	}

	const isBrave = navigator.brave && (await navigator.brave.isBrave());
	if (isBrave) {
		return Browser.Brave;
	}

	if (userAgent.includes("Chrome")) {
		return Browser.Chrome;
	}

	return Browser.Unknown;
}

chrome.storage.local.get("cfg").then(({ cfg: config }) => {
	if (!config.dataCollectionPermissions?.browsingActivity || !config.dataCollectionPermissions?.websiteContent) {
		document.body.appendChild(new DataCollectionConsentDialog().node);
	}
});

document.body.appendChild(
	new Header({
		title: chrome.i18n.getMessage("welcome_page_header_text"),
		subtitle: chrome.i18n.getMessage("welcome_page_subheader")
	}).node
);

document.body.appendChild(new MainContent().node);

document.body.appendChild(new Footer().node);

detectBrowser().then((browser) => {
	document.body.appendChild(new InfoTile({ browser }).node);
});
