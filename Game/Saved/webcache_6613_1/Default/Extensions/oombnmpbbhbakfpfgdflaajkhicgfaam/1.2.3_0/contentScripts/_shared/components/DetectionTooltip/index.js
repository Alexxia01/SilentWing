class DetectionStatusTooltip extends Tooltip {
	static status = Object.freeze({ bad: "bad", warning: "warning", good: "good" });

	constructor() {
		super(detectionStatusTooltipStylesCSS);
	}

	renderContent(root) {
		const content = document.createElement("div");
		content.className = "popup-content";

		const img = document.createElement("img");
		img.className = "popup-img";
		img.src = chrome.runtime.getURL("contentScripts/_shared/assets/icon_eset.svg");

		this.textElement = document.createElement("p");
		this.textElement.className = "popup-text";

		content.append(img, this.textElement);
		root.appendChild(content);
	}

	show(targetElement, { status, text } = {}) {
		this.tooltipElement.dataset.status = status;
		this.textElement.innerText = text || "";
		super.show(targetElement);
	}
}
