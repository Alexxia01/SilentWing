class GuiDrawer {
	static iconStates = StateIndicator.iconStates;
	static tooltipStatus = {
		warning: "warning",
		bad: "bad",
		badScript: "bad-script",
	};

	constructor() {
		this.stateIndicator = new StateIndicator();
		this.detectionTooltip = new DetectionStatusTooltip();
	}

	get currentState() {
		return this.stateIndicator.currentState;
	}

	drawIcon(element, providerName, isDarkMode) {
		this.stateIndicator.draw(element, providerName, isDarkMode);
	}

	setIconState(state = GuiDrawer.iconStates.default) {
		this.stateIndicator.setState(state);
	}

	showTooltip(status, targetElement = this.stateIndicator.element) {
		switch (status) {
			case GuiDrawer.tooltipStatus.warning:
				this.detectionTooltip.show(targetElement, {
					status: DetectionStatusTooltip.status.warning,
					text: chrome.i18n.getMessage("ai_conversation_security_detection_result_warning"),
				});

				break;
			case GuiDrawer.tooltipStatus.bad:
				this.detectionTooltip.show(targetElement, {
					status: DetectionStatusTooltip.status.bad,
					text: chrome.i18n.getMessage("ai_conversation_security_detection_result_bad"),
				});

				break;
			case GuiDrawer.tooltipStatus.badScript:
				this.detectionTooltip.show(targetElement, {
					status: DetectionStatusTooltip.status.bad,
					text: chrome.i18n.getMessage("ai_conversation_security_detection_result_bad_script"),
				});

				break;
			default:
				break;
		}
	}

	markDetections(elements, type, category = DETECTION_CATEGORY.bad) {
		const isBad = category === DETECTION_CATEGORY.bad;
		const tooltipStatus = isBad ? DetectionStatusTooltip.status.bad : DetectionStatusTooltip.status.warning;
		const tooltipText =
			type === DETECTION_TYPE.scripts
				? chrome.i18n.getMessage("ai_conversation_security_detection_result_bad_script")
				: isBad
					? chrome.i18n.getMessage("ai_conversation_security_detection_result_bad")
					: chrome.i18n.getMessage("ai_conversation_security_detection_result_warning");

		for (const element of elements) {
			if (element.dataset.bpsLlmScanDetection) {
				continue;
			}

			element.dataset.bpsLlmScanDetection = category;

			const [shadowHost, shadowRoot] = createStyledShadowDom(detectionMarkStylesCSS);
			shadowHost.className = "detection-mark";

			for (const eventType of ["mouseenter", "mouseleave", "mouseover", "mouseout"]) {
				shadowHost.addEventListener(
					eventType,
					(e) => {
						e.stopImmediatePropagation();

						if (!e.bubbles) {
							return;
						}

						e.stopPropagation();
					},
					{ capture: true },
				);
			}

			const logo = document.createElement("img");
			logo.className = "detection-mark__logo";
			logo.src = isBad
				? chrome.runtime.getURL("contentScripts/llmScan/ui/assets/detection_bad.svg")
				: chrome.runtime.getURL("contentScripts/llmScan/ui/assets/detection_warning.svg");
			logo.alt = "";

			element.parentElement?.insertBefore(shadowHost, element.nextSibling);

			const iconSize = 28;
			const outlineOffset = 3;
			const borderWidth = 2;
			const elementRect = element.getBoundingClientRect();
			const shadowHostRect = shadowHost.getBoundingClientRect();
			const hasRightSpace = window.innerWidth - elementRect.right >= iconSize + outlineOffset;
			logo.style.top = `${elementRect.top - shadowHostRect.top - outlineOffset - borderWidth}px`;
			logo.style.left = hasRightSpace
				? `${elementRect.right - shadowHostRect.left + outlineOffset}px`
				: `${elementRect.left - shadowHostRect.left - iconSize - outlineOffset}px`;

			element.dataset.bpsLlmScanIconSide = hasRightSpace ? "right" : "left";

			if (Math.round(elementRect.height + (outlineOffset + borderWidth) * 2) <= iconSize) {
				element.dataset.bpsLlmScanIconHeightMatch = "true";
			}

			shadowRoot.appendChild(logo);

			logo.addEventListener("mouseenter", (event) => {
				event.stopImmediatePropagation();

				this.detectionTooltip.show(logo, { status: tooltipStatus, text: tooltipText });
			});

			logo.addEventListener("mouseleave", () => {
				this.detectionTooltip.hide();
			});
		}
	}
}
