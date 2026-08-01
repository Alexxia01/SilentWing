class Tooltip {
	constructor(styles) {
		this.tooltipElement = null;
		this.htmlDirection = document.documentElement.getAttribute("dir");
		this.styles = styles;

		this.render();
	}

	async render() {
		const stylesCSS = tooltipStylesCSS.concat(this.styles || "");

		const [shadowHost, shadowRoot] = createStyledShadowDom(stylesCSS);

		this.tooltipElement = document.createElement("div");
		this.tooltipElement.className = "popup";

		if (this.htmlDirection === "rtl") {
			this.tooltipElement.dir = "rtl";
		}

		const { cfg } = await chrome.storage.local.get("cfg");

		this.tooltipElement.classList.add(cfg.darkMode ? "dark-mode" : "light-mode");

		this.renderContent(this.tooltipElement);
		shadowRoot.appendChild(this.tooltipElement);
		this.hide();
		document.body.append(shadowHost);
	}

	renderContent(root) {
		/* override in subclass */
	}

	show(targetElement) {
		this.tooltipElement.classList.remove("popup-hidden");
		this.setPosition(targetElement);
	}

	setPosition(targetElement) {
		const box = targetElement.getBoundingClientRect();
		const tooltipWidth = this.tooltipElement.offsetWidth;
		const tooltipHeight = this.tooltipElement.offsetHeight;
		const gap = targetElement.offsetWidth + 12;
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let left;
		let flipped = false;

		if (this.htmlDirection === "rtl") {
			// Default: tooltip to the left of target
			left = box.right + scrollX - tooltipWidth - gap;
			if (left < scrollX) {
				// Not enough space on the left — flip to the right
				left = box.left + scrollX + gap;
				flipped = true;
			}
		} else {
			// Default: tooltip to the right of target
			left = box.left + scrollX + gap;
			if (left + tooltipWidth > scrollX + viewportWidth) {
				// Not enough space on the right — flip to the left
				left = box.right + scrollX - tooltipWidth - gap;
				flipped = true;
			}
		}

		// Vertical: align with target then clamp within viewport
		let top = box.top + scrollY - targetElement.offsetHeight + 10;
		const bottomEdge = top + tooltipHeight;
		const maxBottom = scrollY + viewportHeight;

		if (bottomEdge > maxBottom) {
			top = maxBottom - tooltipHeight;
		}

		if (top < scrollY) {
			top = scrollY;
		}

		this.tooltipElement.style.left = `${left}px`;
		this.tooltipElement.style.top = `${top}px`;
		this.tooltipElement.classList.toggle("popup--flipped", flipped);
	}

	hide() {
		this.tooltipElement.classList.add("popup-hidden");
	}
}
