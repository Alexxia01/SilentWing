class DataCollectionConsentDialog extends BaseComponent {
	/**
	 * @param {Object} props
	 */
	constructor(props) {
		super(props);
		document.body.style.overflow = "hidden";

		this.render();
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = "consent-dialog__fade";

		const dialog = document.createElement("div");
		dialog.className = "consent-dialog";

		const content = document.createElement("div");
		content.className = "consent-dialog__content";

		const logo = document.createElement("img");
		logo.className = "consent-dialog__logo";
		logo.src = "../../assets/eset-logo.svg";
		logo.alt = chrome.i18n.getMessage("eset_logo_alt");

		const title = document.createElement("span");
		title.className = "consent-dialog__title";
		title.innerText = chrome.i18n.getMessage("data_collection_consent_dialog_title");

		const descriptionSection = document.createElement("div");
		descriptionSection.className = "consent-dialog__description-section";
		if (longWordLangs.includes(chrome.i18n.getUILanguage())) {
			descriptionSection.classList.add("consent-dialog__description-section_long-word");
		}

		const descriptionTextItems = [
			chrome.i18n.getMessage("data_collection_consent_dialog_description_1"),
			chrome.i18n.getMessage("data_collection_consent_dialog_description_2"),
			chrome.i18n.getMessage("data_collection_consent_dialog_description_3"),
		];

		descriptionTextItems.forEach((descriptionText) => {
			const descriptionParagraph = document.createElement("div");
			descriptionParagraph.innerText = descriptionText;
			descriptionSection.appendChild(descriptionParagraph);
		});

		const buttonsSection = document.createElement("div");
		buttonsSection.className = "consent-dialog__buttons-section";

		const agreeBtn = new Button({
			title: chrome.i18n.getMessage("data_collection_consent_dialog_agree_button"),
			onClick: async () => {
				chrome.runtime.sendMessage({
					msg: "data_collection_consent_agree",
				});

				const { cfg: config } = await chrome.storage.local.get("cfg");

				config.dataCollectionPermissions.browsingActivity = true;
				config.dataCollectionPermissions.websiteContent = true;
				if (config.permissions) {
					config.isWebsiteScanEnabled = true;
				}

				await chrome.storage.local.set({ cfg: config });

				document.body.style.overflow = "";
				this.element.remove();
			},
		});

		const declineBtn = new Button({
			title: chrome.i18n.getMessage("data_collection_consent_dialog_decline_button"),
			style: "secondary",
			onClick: async () => {
				chrome.runtime.sendMessage({
					msg: "data_collection_consent_decline",
				});

				document.body.style.overflow = "";
				const currentTab = await chrome.tabs.getCurrent();
				chrome.tabs.remove(currentTab.id);
			},
		});

		buttonsSection.appendChild(agreeBtn.node);
		buttonsSection.appendChild(declineBtn.node);

		const footer = document.createElement("span");
		footer.className = "consent-dialog__footer";
		getDomElementsFromString(chrome.i18n.getMessage("data_collection_consent_dialog_footer")).forEach((element) => {
			if (element.className === "privacy-policy-link") {
				chrome.storage.local.get("cfg").then(({ cfg: config }) => {
					element.addEventListener("click", () =>
						window.open(GetHelpLink(config.productType, config.productVersion, HelpLinkTopic.privacyPolicy), "_blank"),
					);
				});
			}

			footer.appendChild(element);
		});

		content.appendChild(logo);
		content.appendChild(title);
		content.appendChild(descriptionSection);
		content.appendChild(buttonsSection);
		content.appendChild(footer);
		dialog.appendChild(content);
		this.element.appendChild(dialog);
		this.node.appendChild(this.element);
	}
}
