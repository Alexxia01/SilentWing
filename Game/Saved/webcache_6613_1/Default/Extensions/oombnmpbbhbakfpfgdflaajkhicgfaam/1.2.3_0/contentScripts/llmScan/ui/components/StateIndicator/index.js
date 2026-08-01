class StateIndicator {
	static iconStates = {
		default: "default",
		notifying: "notifying",
		scanning: "scanning",
		badResult: "bad-result",
		warningResult: "warning-result",
		goodResult: "good-result",
	};

	constructor() {
		this.element = null;
		this.notifyingClickHandler = null;
		this.infoTooltip = new InfoTooltip();
	}

	get currentState() {
		return this.element.dataset.state || StateIndicator.iconStates.default;
	}

	draw(parentElement, providerName, isDarkMode) {
		const isDomExpected = this.isDomExpected(providerName, parentElement);

		if (!isDomExpected) {
			return;
		}

		const [shadowHost, shadowRoot] = createStyledShadowDom(stateIndicatorIconStylesCSS);
		const iconElem = document.createElement("div");
		iconElem.className = isDarkMode ? "state-indicator dark-mode" : "state-indicator";

		this.element = iconElem;
		shadowRoot.appendChild(iconElem);
		parentElement.appendChild(shadowHost);

		this.changeExternalStyles(providerName, parentElement);

		this.notifyingClickHandler = null;
	}

	setState(state = StateIndicator.iconStates.default) {
		if (!this.element) {
			return;
		}

		if (
			this.element.dataset.state === StateIndicator.iconStates.notifying &&
			state !== StateIndicator.iconStates.notifying
		) {
			chrome.storage.local.get("cfg").then(({ cfg }) => {
				if (!cfg || cfg.isLlmScanFirstVisitDone) {
					return;
				}

				cfg.isLlmScanFirstVisitDone = true;

				chrome.storage.local.set({ cfg: cfg });
			});
		}

		if (state !== StateIndicator.iconStates.notifying && this.notifyingClickHandler) {
			this.element.removeEventListener("click", this.notifyingClickHandler);
			this.notifyingClickHandler = null;
		}

		if (state === StateIndicator.iconStates.notifying && !this.notifyingClickHandler) {
			this.addNotifyingClickEventListener();
		}

		this.element.dataset.state = state;
	}

	changeExternalStyles(providerName, parentElement) {
		const iconState = this.element.dataset.state || StateIndicator.iconStates.default;

		switch (providerName) {
			case PROVIDER_NAME.chatgpt:
				parentElement.style.display = "flex";

				const secondChild = parentElement.children[1];

				if (iconState === StateIndicator.iconStates.notifying) {
					secondChild.style.width = "calc(100% - 88px)";
				} else if (iconState === StateIndicator.iconStates.default) {
					secondChild.style.width = "calc(100% - 54px)";
				} else {
					secondChild.style.width = "calc(100% - 56px)";
				}

				break;
			default:
				break;
		}
	}

	isDomExpected(providerName, parentElement) {
		switch (providerName) {
			case PROVIDER_NAME.chatgpt:
				if (parentElement.children.length !== 2) {
					return false;
				}

				const secondChild = parentElement.children[1];

				if (!(secondChild.querySelector("#prompt-textarea") || secondChild.querySelector("[name='prompt-textarea']"))) {
					return false;
				}

				return true;

			default:
				return false;
		}
	}

	addNotifyingClickEventListener() {
		if (this.notifyingClickHandler) {
			return;
		}

		this.notifyingClickHandler = () => {
			this.infoTooltip.show(this.element);
			this.setState(StateIndicator.iconStates.default);
		};

		this.element.addEventListener("click", this.notifyingClickHandler);
	}
}
