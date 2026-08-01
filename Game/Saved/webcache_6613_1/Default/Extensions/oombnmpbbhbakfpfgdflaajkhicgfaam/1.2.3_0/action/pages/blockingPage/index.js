const goBackBtn = document.querySelector("#go-back-button");
const ignoreThreatBtn = document.querySelector("#ignore-threat-button");
const blockedUrlTooltip = document.querySelector(".blocked-url-tooltip");
const learnMoreLink = document.querySelector(".learn-more-link");

const { searchParams } = new URL(location.href);
const msgId = searchParams.get("id");

goBackBtn.addEventListener("click", async () => {
	chrome.runtime.sendMessage({ msg: "blocking_page_go-back" });

	if (window.history.length > 1) {
		history.back();
	} else {
		const currentTab = await chrome.tabs.getCurrent();

		chrome.tabs.create({ active: true, index: currentTab.index });
		chrome.tabs.remove(currentTab.id);
	}
});

chrome.storage.local
	.get(["cfg", StorageKey.WebsiteScanBlockList])
	.then(({ cfg: config, [StorageKey.WebsiteScanBlockList]: blockList = {} }) => {
		learnMoreLink.href = GetHelpLink(config.productType, config.productVersion, HelpLinkTopic.blockedContent);

		const webPageURL = blockList[msgId];

		if (!webPageURL) {
			return;
		}

		blockedUrlTooltip.title = webPageURL;

		ignoreThreatBtn.addEventListener("click", async () => {
			chrome.runtime.sendMessage({
				msg: "blocking_page_ignore",
				details: {
					url:
						config.dataCollectionPermissions.browsingActivity && config.dataCollectionPermissions.websiteContent
							? webPageURL
							: "n/a",
				},
			});

			const { [StorageKey.WebsiteScanIgnoreList]: ignoreList = [] } = await chrome.storage.session.get([
				StorageKey.WebsiteScanIgnoreList,
			]);
			const webPageUrlHost = new URL(webPageURL).host;

			await chrome.storage.session.set({
				[StorageKey.WebsiteScanIgnoreList]: [...ignoreList, webPageUrlHost || webPageURL],
			});

			location.replace(webPageURL);
		});
	});
