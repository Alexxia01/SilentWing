class MainContent extends BaseComponent {
	/**
	 * @param {Object} props
	 */
	constructor(props) {
		super(props);

		this.init();
	}

	init() {
		this.allowAccessSection = new AllowAccessSection({
			title: chrome.i18n.getMessage("whats_new_page_allow_access_section_title"),
			description: chrome.i18n.getMessage("whats_new_page_allow_access_section_description"),
			onButtonClick: async () => {
				chrome.runtime.sendMessage({
					msg: "whats_new_ask_permissions",
				});

				const isPermissionGranted = await chrome.permissions.request({ origins: [AllUrls] });

				if (isPermissionGranted) {
					chrome.runtime.sendMessage({
						msg: "whats_new_grant_permissions",
					});
				}
			},
			isVisible: false,
		});

		this.learnMoreLink = document.createElement("a");

		chrome.storage.local.get("cfg").then(({ cfg: config }) => {
			this.setAllowAccessSectionVisibility(config.permissions);
			this.learnMoreLink.href = GetHelpLink(config.productType, config.productVersion);
		});

		chrome.storage.onChanged.addListener((changes, area) => {
			const newConfig = changes.cfg?.newValue;

			if (!newConfig || area !== "local") {
				return;
			}

			this.setAllowAccessSectionVisibility(newConfig.permissions);
		});

		this.render();
	}

	setAllowAccessSectionVisibility(isPermissionGranted) {
		this.allowAccessSection.props.isVisible = !isPermissionGranted;
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = "main-content";

		const mainContent = document.createElement("div");
		mainContent.className = "main-content__update-info";

		const infoSection = document.createElement("div");
		infoSection.className = "update-info__text-content";

		const header = document.createElement("div");
		header.className = "text-content__header";

		const icon = new Icon({
			href: "../../assets/icons.svg#ai-conversation-security-icon",
			className: "text-content-header__icon",
		});

		const title = document.createElement("h1");
		title.className = "text-content-header__title";
		title.innerText = chrome.i18n.getMessage("whats_new_page_title");

		header.appendChild(icon.node);
		header.appendChild(title);
		infoSection.appendChild(header);

		const featureDescription = document.createElement("div");
		featureDescription.className = "text-content__description";
		const featureDescriptionText = chrome.i18n.getMessage("whats_new_page_description");
		getDomElementsFromString(featureDescriptionText).forEach((element) => {
			featureDescription.appendChild(element);
		});

		this.learnMoreLink.className = "text-content__learn-more-link";
		this.learnMoreLink.target = "_blank";
		this.learnMoreLink.innerText = chrome.i18n.getMessage("learn_more_link");

		const externalLinkIcon = new Icon({
			href: "../../assets/icons.svg#external-link",
			className: "learn-more-link__icon",
		});

		this.learnMoreLink.appendChild(externalLinkIcon.node);

		infoSection.appendChild(featureDescription);
		infoSection.appendChild(this.learnMoreLink);
		mainContent.appendChild(infoSection);

		const previewImage = document.createElement("img");
		previewImage.className = "update-info__preview-image";
		previewImage.src = "../../assets/ai-conversation-security-preview.png";
		previewImage.alt = chrome.i18n.getMessage("whats_new_page_image_alt");

		mainContent.appendChild(previewImage);

		this.element.appendChild(this.allowAccessSection.node);
		this.element.appendChild(mainContent);

		this.node.appendChild(this.element);
	}
}
