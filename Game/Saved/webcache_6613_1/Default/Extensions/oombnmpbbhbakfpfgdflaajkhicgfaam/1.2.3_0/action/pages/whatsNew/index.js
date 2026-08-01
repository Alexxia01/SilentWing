document.body.appendChild(
	new Header({
		title: chrome.i18n.getMessage("whats_new_page_header"),
		subtitle: chrome.i18n.getMessage("whats_new_page_subheader"),
	}).node,
);

const mainContent = document.createElement("div");
mainContent.className = "whats-new__main-content container";

chrome.storage.local.get("cfg").then(({ cfg: config }) => {
	if (!config.dataCollectionPermissions?.browsingActivity || !config.dataCollectionPermissions?.websiteContent) {
		document.body.appendChild(new DataCollectionConsentDialog().node);
	}

	mainContent.appendChild(new MainContent().node);
});

document.body.appendChild(mainContent);

document.body.appendChild(new Footer().node);
