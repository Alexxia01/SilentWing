class BrowserCleanupDataCheckboxes extends BaseComponent {
	#browsingDataPermissions = {
		browsingHistory: ["history"],
		downloadHistory: ["downloads"],
		cookiesAndSiteData: isChrome
			? ["cookies", "localStorage", "indexedDB", "cacheStorage"]
			: ["cookies", "localStorage", "indexedDB"],
		cachedImages: ["cache"],
		passwords: ["passwords"],
		formData: ["formData"],
		serviceWorkers: ["serviceWorkers"]
	};

	#customDataCheckboxes = [
		{
			value: "browsingHistory",
			label: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_1"),
			tooltip: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_1_tooltip")
		},
		{
			value: "downloadHistory",
			label: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_2"),
			tooltip: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_2_tooltip")
		},
		{
			value: "cookiesAndSiteData",
			label: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_3"),
			tooltip: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_3_tooltip")
		},
		{
			value: "cachedImages",
			label: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_4"),
			tooltip: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_4_tooltip")
		},
		{
			value: "passwords",
			label: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_5"),
			tooltip: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_5_tooltip")
		},
		{
			value: "formData",
			label: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_6"),
			tooltip: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_6_tooltip")
		},
		{
			value: "serviceWorkers",
			label: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_7"),
			tooltip: chrome.i18n.getMessage("browsing_cleanup_custom_data_option_7_tooltip")
		}
	];

	/**
	 * @param {Object} props
	 * @param {Object} props.checkedOptions
	 * @param {(browserDataList: string[], isChecked: boolean) => void} props.onChange
	 * @param {string} props.className
	 */
	constructor(props) {
		super(props);

		this.cleanupPermissions = { ...this.props.checkedOptions };
		this.render();
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = `browser-cleanup-data-checkboxes ${this.props.className || ""}`;

		this.#customDataCheckboxes.forEach(({ value, label: labelText, tooltip: tooltipText }, idx) => {
			const isAnyPropertyChecked = this.#browsingDataPermissions[value]?.some(
				(property) => this.props.checkedOptions[property]
			);

			const checkboxContainer = document.createElement("div");
			checkboxContainer.className = "checkbox-container";

			const input = document.createElement("input");
			input.type = "checkbox";
			input.className = "checkbox-input";
			input.id = "customAr" + idx;
			input.name = "customAr";
			input.value = value;
			input.checked = isAnyPropertyChecked;
			input.addEventListener("change", (event) => {
				this.#browsingDataPermissions[value].forEach((permission) => {
					if (event.currentTarget.checked) {
						this.cleanupPermissions[permission] = true;
					} else {
						delete this.cleanupPermissions[permission];
					}
				});

				this.props.onChange(this.cleanupPermissions);
			});

			const labelContent = document.createElement("div");
			labelContent.className = "checkbox-label-container";

			const labelElem = document.createElement("label");
			labelElem.className = "checkbox-label-container_text";
			labelElem.setAttribute("for", "customAr" + idx);
			labelElem.innerText = labelText;

			const infoIcon = new Icon({
				href: "./assets/icons.svg#info-icon",
				className: "checkbox-label-container_info-icon"
			});

			const infoIconTooltip = new Tooltip({
				child: infoIcon.node,
				content: document.createTextNode(tooltipText),
				className: "checkbox-tooltip"
			});

			if (value === "passwords") {
				const labelWrapper = document.createElement("div");
				labelWrapper.className = "checkbox-label_wrapper";

				const labelNotice = document.createElement("div");
				labelNotice.className = "checkbox-label_notice";
				labelNotice.style.display = isAnyPropertyChecked ? "block" : "none";
				labelNotice.innerText = chrome.i18n.getMessage("browsing_cleanup_custom_data_option_5_note");

				input.addEventListener("change", (event) => {
					labelNotice.style.display = event.currentTarget.checked ? "block" : "none";
				});

				labelWrapper.appendChild(labelElem);
				labelWrapper.appendChild(labelNotice);
				labelContent.appendChild(labelWrapper);
			} else {
				labelContent.appendChild(labelElem);
			}

			labelContent.appendChild(infoIconTooltip.node);
			checkboxContainer.appendChild(input);
			checkboxContainer.appendChild(labelContent);
			this.element.appendChild(checkboxContainer);
		});

		this.node.appendChild(this.element);
	}
}
