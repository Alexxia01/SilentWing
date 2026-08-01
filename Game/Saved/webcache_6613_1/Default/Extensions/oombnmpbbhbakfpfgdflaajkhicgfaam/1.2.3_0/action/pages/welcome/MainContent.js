class MainContent extends BaseComponent {
	#featureTilesInfo = [
		{
			title: chrome.i18n.getMessage("ai_conversation_security_header"),
			description: chrome.i18n.getMessage("welcome_page_ai_conversation_security_tile_text"),
			iconSrc: "../../assets/icons.svg#ai-conversation-security-icon",
			requiredFields: ["isLlmScanSupported"],
		},
		{
			title: chrome.i18n.getMessage("secure_search_header"),
			description: chrome.i18n.getMessage("welcome_page_secure_search_tile_text"),
			iconSrc: "../../assets/icons.svg#secure-search-icon",
		},
		{
			title: chrome.i18n.getMessage("browsing_cleanup_header"),
			description: chrome.i18n.getMessage("welcome_page_browser_cleanup_tile_text"),
			iconSrc: "../../assets/icons.svg#browser-cleanup-icon",
		},
		{
			title: chrome.i18n.getMessage("website_security_inspector_title"),
			description: chrome.i18n.getMessage("welcome_page_website_security_inspector_tile_text"),
			iconSrc: "../../assets/icons.svg#website-security-inspector",
			requiredFields: ["isWebsiteScanSupported"],
		},
		{
			title: chrome.i18n.getMessage("welcome_page_metadata_cleanup_tile_header"),
			description: chrome.i18n.getMessage("welcome_page_metadata_cleanup_tile_text"),
			iconSrc: "../../assets/icons.svg#metadata-cleanup-icon",
		},
		{
			title: chrome.i18n.getMessage("welcome_page_website_settings_tile_header"),
			description: chrome.i18n.getMessage("welcome_page_website_settings_tile_text"),
			iconSrc: "../../assets/icons.svg#website-setting-icon",
		},
	];

	/**
	 * @param {Object} props
	 */
	constructor(props) {
		super(props);

		this.init();
	}

	init() {
		this.allowAccessSection = new AllowAccessSection({
			title: chrome.i18n.getMessage("welcome_page_allow_access_section_title"),
			description: chrome.i18n.getMessage("welcome_page_allow_access_section_description"),
			onButtonClick: async () => {
				chrome.runtime.sendMessage({
					msg: "welcome_page_ask_permissions",
				});

				const isPermissionGranted = await chrome.permissions.request({ origins: [AllUrls] });

				if (isPermissionGranted) {
					chrome.runtime.sendMessage({
						msg: "welcome_page_grant_permissions",
					});
				}
			},
			isVisible: false,
		});

		this.featureTiles = document.createElement("div");

		chrome.storage.local.get("cfg").then(({ cfg: config }) => {
			this.setAllowAccessSectionVisibility(config.permissions);
			this.renderFeatureTiles(config);
		});

		chrome.storage.onChanged.addListener((changes, area) => {
			const oldConfig = changes.cfg?.oldValue;
			const newConfig = changes.cfg?.newValue;

			if (!newConfig || area !== "local") {
				return;
			}

			this.setAllowAccessSectionVisibility(newConfig.permissions);
			this.renderFeatureTiles(newConfig, oldConfig);
		});

		this.render();
	}

	setAllowAccessSectionVisibility(isPermissionGranted) {
		this.allowAccessSection.props.isVisible = !isPermissionGranted;
	}

	renderFeatureTiles(config, oldConfig = {}) {
		const shouldBeRendered = this.#featureTilesInfo.some(
			(info) =>
				info.requiredFields &&
				info.requiredFields.some((requiredField) => config[requiredField] !== oldConfig[requiredField]),
		);

		if (!shouldBeRendered) {
			return;
		}

		const tiles = document.createDocumentFragment();

		this.#featureTilesInfo.forEach((info) => {
			if (!info.requiredFields || info.requiredFields.every((requiredField) => !!config[requiredField])) {
				tiles.appendChild(
					new FeatureTile({ title: info.title, description: info.description, iconSrc: info.iconSrc }).node,
				);
			}
		});

		this.featureTiles.innerText = "";
		this.featureTiles.appendChild(tiles);
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = "main-content container";

		const title = document.createElement("h1");
		title.className = "main-content__title";
		title.innerText = chrome.i18n.getMessage("welcome_page_main_content_title");

		this.featureTiles.className = "main-content__feature-tiles";

		const note = document.createElement("div");
		note.className = "main-content__note";
		note.innerText = chrome.i18n.getMessage("welcome_page_ultime_feature");

		this.element.appendChild(title);
		this.element.appendChild(this.allowAccessSection.node);
		this.element.appendChild(this.featureTiles);
		this.element.appendChild(note);
		this.node.appendChild(this.element);
	}
}
