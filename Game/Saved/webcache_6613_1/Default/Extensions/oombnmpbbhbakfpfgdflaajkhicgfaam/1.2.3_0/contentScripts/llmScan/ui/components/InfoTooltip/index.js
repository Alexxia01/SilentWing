class InfoTooltip extends Tooltip {
	constructor() {
		super(infoTooltipStylesCSS);
	}

	renderContent(root) {
		const container = document.createElement("div");
		container.className = "info-tooltip";

		const header = document.createElement("div");
		header.className = "info-popup__header";

		const titleLogo = document.createElement("img");
		titleLogo.className = "info-popup__title-logo";
		titleLogo.src = chrome.runtime.getURL("contentScripts/llmScan/ui/assets/eset-bps-logo.svg");

		const closeIcon = document.createElement("div");
		closeIcon.className = "info-popup__close-btn";
		closeIcon.addEventListener("click", () => this.hide());

		header.append(titleLogo, closeIcon);

		const content = document.createElement("div");
		content.className = "info-popup__body";

		const message = document.createElement("div");
		message.className = "info-popup__message";
		getDomElementsFromString(chrome.i18n.getMessage("ai_conversation_security_onboarding")).forEach((element) => {
			message.appendChild(element);
		});

		const extensionPopupLink = message.querySelector(".extension-popup-link");

		if (extensionPopupLink) {
			extensionPopupLink.addEventListener("click", (e) => {
				e.preventDefault();
				chrome.runtime.sendMessage({ msg: "open_extension_popup" });
				this.hide();
			});
		}

		const externalLink = document.createElement("a");
		externalLink.className = "info-popup__external-link";
		externalLink.target = "_blank";
		externalLink.addEventListener("click", () => this.hide());

		chrome.runtime.sendMessage({ msg: "get-help-link" }).then((helpLink) => {
			externalLink.href = helpLink;
		});

		const externalLinkText = document.createElement("span");
		externalLinkText.innerText = chrome.i18n.getMessage("learn_more_link");

		const externalLinkIcon = document.createElement("div");
		externalLinkIcon.className = "info-popup__external-link-icon";

		externalLink.append(externalLinkText, externalLinkIcon);
		content.append(message, externalLink);
		container.append(header, content);

		root.appendChild(container);
	}

	show(targetElement) {
		super.show(targetElement);
	}
}

function getDomElementsFromString(htmlString) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, "text/html");

	return Array.from(doc.body.childNodes);
}
