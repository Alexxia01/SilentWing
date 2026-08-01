const websiteScanExcludedList = ["chromewebstore.google.com"];

function runWebsiteScan({ tabUrl, frameId, shouldScanIframesWithSpecialSrc }) {
	const getFrameURL = (targetWindow) => {
		const url = targetWindow.location?.href;

		if (url && ["http://", "https://", "file:///"].some((s) => url.startsWith(s))) {
			return url;
		} else {
			try {
				return targetWindow.parent.location?.href;
			} catch {
				return targetWindow.document.referrer;
			}
		}
	};

	const sendScannedHTML = (targetWindow, isFrameWithSpecialSrc = false) => {
		const scannedHTML = targetWindow.document.documentElement.outerHTML;

		if (scannedHTML.length < 60) {
			

			return;
		}

		chrome.runtime.sendMessage({
			msg: "website-scan",
			data: {
				html: scannedHTML,
				title: targetWindow.document.title,
				frameUrl: getFrameURL(targetWindow),
				tabUrl: frameId === 0 && !isFrameWithSpecialSrc ? "" : tabUrl
			}
		});
	};

	const scanIframesWithSpecialSrc = () => {
		const iframes = document.querySelectorAll(`iframe[src^="blob:"], iframe[src^="javascript:"]`);

		iframes.forEach((iframe) => {
			try {
				sendScannedHTML(iframe.contentWindow, true);
			} catch (error) {
				
			}
		});
	};

	if (shouldScanIframesWithSpecialSrc) {
		scanIframesWithSpecialSrc();
	}

	sendScannedHTML(window);

	return { isDocumentLoaded: document.readyState === "complete" };
}

function addWebsiteScanListener() {
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		if (msg.cmd !== "website-scan") {
			return;
		}

		if (!msg.block) {
			return;
		}

		chrome.runtime.sendMessage({ msg: "blocking_page_open" });
		location.replace(`${chrome.runtime.getURL("./action/pages/blockingPage/index.html")}?id=${msg.msgId}`);
	});
}
