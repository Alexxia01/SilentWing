chrome.storage.local.get("cfg").then(({ cfg: config }) => {
	if (!config.dataCollectionPermissions?.browsingActivity || !config.dataCollectionPermissions?.websiteContent) {
		document.body.appendChild(new DataCollectionConsentDialog().node);
	}
});

document.body.appendChild(new Header().node);

document.body.appendChild(new MainContent().node);

document.body.appendChild(new Footer().node);
