class RegularCleanupSettings extends BaseComponent {
	#config = {};

	#frequencyOptions = [
		{
			value: BrowserCleanupPeriod.BrowsingSession,
			label: chrome.i18n.getMessage("browsing_regular_cleanup_select_form_option_1"),
			selected: false,
		},
		{
			value: BrowserCleanupPeriod.Hour,
			label: chrome.i18n.getMessage("browsing_regular_cleanup_select_form_option_2"),
			selected: false,
		},
		{
			value: BrowserCleanupPeriod.Day,
			label: chrome.i18n.getMessage("browsing_regular_cleanup_select_form_option_3"),
			selected: false,
		},
		{
			value: BrowserCleanupPeriod.Week,
			label: chrome.i18n.getMessage("browsing_regular_cleanup_select_form_option_4"),
			selected: false,
		},
		{
			value: BrowserCleanupPeriod.Month,
			label: chrome.i18n.getMessage("browsing_regular_cleanup_select_form_option_5"),
			selected: false,
		},
	];

	/**
	 * @param {Object} props
	 * @param {string} props.className
	 */
	constructor(props) {
		super(props);

		this.element = document.createElement("div");
		this.node.appendChild(this.element);
		this.init();
	}

	init = () => {
		chrome.storage.local.get("cfg", (data) => {
			Object.assign(this.#config, data.cfg);

			if (this.#config.histArPeriod !== BrowserCleanupPeriod.Unselected) {
				const selectedOptionIdx = this.#frequencyOptions.findIndex(
					(option) => option.value === this.#config.histArPeriod,
				);
				this.#frequencyOptions[selectedOptionIdx].selected = true;
			}

			this.render();
		});
	};

	get browserCleanupData() {
		return {
			autoRemoveOption: this.#config.autoRemoveOption,
			customArOptions: this.#config.customArOptions,
			datatype: this.#config.datatype,
			datatypeAr: this.#config.datatypeAr,
			histArPeriod: this.#config.histArPeriod,
			histPeriod: this.#config.histPeriod,
			nextCleanupTime: this.#config.nextCleanupTime,
		};
	}

	setClassList = () => {
		this.element.setAttribute("class", this.props.className);
	};

	updateFrequencyOptions = () => {
		if (this.#config.histArPeriod === BrowserCleanupPeriod.Unselected) {
			return;
		}

		const prevSelectedOptionIdx = this.#frequencyOptions.findIndex((option) => option.selected === true);

		if (prevSelectedOptionIdx && this.#frequencyOptions[prevSelectedOptionIdx].value === this.#config.histArPeriod) {
			return;
		}

		const selectedOptionIdx = this.#frequencyOptions.findIndex((option) => option.value === this.#config.histArPeriod);

		this.#frequencyOptions[prevSelectedOptionIdx].selected = false;
		this.#frequencyOptions[selectedOptionIdx].selected = true;
	};

	showDatatypeSubcontent = () => {
		switch (this.#config.datatypeAr) {
			case BrowsingDataType.Custom:
				this.privateDataDescription.style.display = "none";
				this.customOptions.style.display = "block";
				break;
			case BrowsingDataType.Private:
				this.customOptions.style.display = "none";
				this.privateDataDescription.style.display = "flex";
				break;
			default:
				this.privateDataDescription.style.display = "none";
				this.customOptions.style.display = "none";
				break;
		}
	};

	handleButtonAction = async () => {
		const delay = (duration) =>
			new Promise((resolve) => {
				setTimeout(resolve, duration);
			});

		const startTime = Date.now();

		this.cleanupBtn.classList.add("cleanup-btn-disabled");
		this.cleanupBtnSpin.style.display = "block";
		this.cleanupBtnText.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_btn_processing");

		await chrome.runtime.sendMessage({
			msg: "clean-auto",
			data: this.browserCleanupData,
		});

		const elapsedTime = Date.now() - startTime;

		if (elapsedTime < 2500) {
			await delay(2500 - elapsedTime);
		}

		this.cleanupBtnSpin.style.display = "none";
		this.cleanupBtnText.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_btn_coplete");

		await delay(2000);

		window.location.href = "./browsingprivacy.html";
	};

	onCleanupBtnClick = async () => {
		if (
			this.#config.histArPeriod === BrowserCleanupPeriod.Unselected ||
			this.#config.datatypeAr === BrowsingDataType.Unselected ||
			(this.#config.datatypeAr === BrowsingDataType.Custom && !Object.keys(this.#config.customArOptions).length)
		) {
			return;
		}

		this.#config.nextCleanupTime = 0;

		if (this.#config.histArPeriod !== BrowserCleanupPeriod.BrowsingSession) {
			this.handleButtonAction();
		} else {
			chrome.runtime.sendMessage(
				{
					msg: "clean-auto",
					data: this.browserCleanupData,
				},
				(response) => {
					
				},
			);

			window.location.href = "./browsingprivacy.html";
		}
	};

	setCleanupBtnContent = () => {
		if (
			this.#config.histArPeriod === BrowserCleanupPeriod.Unselected ||
			this.#config.datatypeAr === BrowsingDataType.Unselected ||
			(this.#config.datatypeAr === BrowsingDataType.Custom && !Object.keys(this.#config.customArOptions).length)
		) {
			this.cleanupBtn.classList.add("cleanup-btn-disabled");
			this.cleanupBtnText.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_btn_disabled");
		} else if (this.#config.histArPeriod === BrowserCleanupPeriod.BrowsingSession) {
			this.cleanupBtn.classList.remove("cleanup-btn-disabled");
			this.cleanupBtnText.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_btn_schedule");
		} else {
			this.cleanupBtn.classList.remove("cleanup-btn-disabled");
			this.cleanupBtnText.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_btn");
		}
	};

	render = () => {
		this.element.className = "popup-container";

		const popupHeader = new PopupHeader({
			title: chrome.i18n.getMessage("browsing_regular_cleanup_header"),
			description: chrome.i18n.getMessage("browsing_regular_cleanup_header_description"),
			className: "regular-cleanup-header",
		});

		const timeRange = document.createElement("div");
		timeRange.className = "time-range-section";

		const timeRangeTitle = document.createElement("div");
		timeRangeTitle.innerText = chrome.i18n.getMessage("browsing_regular_cleanup_select_form_title");
		timeRangeTitle.className = "popup-section_title";

		const timeRangeOptions = new CustomSelect({
			options: this.#frequencyOptions,
			placeholder: chrome.i18n.getMessage("browsing_regular_cleanup_select_form_placeholder"),
		});
		const onSelect = (option) => {
			this.#config.histArPeriod = option.value;
			this.updateFrequencyOptions();
			timeRangeOptions.props.options = this.#frequencyOptions;
			this.setCleanupBtnContent();
		};
		timeRangeOptions.props.onSelect = onSelect;
		timeRange.appendChild(timeRangeTitle);
		timeRange.appendChild(timeRangeOptions.node);

		const dataType = document.createElement("div");
		dataType.className = "data-type-section";

		const dataTypeTitle = document.createElement("div");
		dataTypeTitle.className = "popup-section_title";
		dataTypeTitle.innerText = chrome.i18n.getMessage("browsing_cleanup_data_btns_header");

		const dataTypeButtons = document.createElement("div");
		const dataTypePrivateButton = document.createElement("button");
		dataTypePrivateButton.className = `data-type-btn ${
			this.#config.datatypeAr === BrowsingDataType.Private ? "data-type-btn_active" : ""
		}`;
		dataTypePrivateButton.innerText = chrome.i18n.getMessage("browsing_cleanup_private_data_btn");

		const dataTypeCustomButton = document.createElement("button");
		dataTypeCustomButton.className = `data-type-btn ${
			this.#config.datatypeAr === BrowsingDataType.Custom ? "data-type-btn_active" : ""
		}`;
		dataTypeCustomButton.innerText = chrome.i18n.getMessage("browsing_cleanup_custom_data_btn");
		dataTypePrivateButton.addEventListener("click", () => {
			this.#config.datatypeAr = BrowsingDataType.Private;
			dataTypeCustomButton.classList.remove("data-type-btn_active");
			dataTypePrivateButton.classList.add("data-type-btn_active");
			this.showDatatypeSubcontent();
			this.setCleanupBtnContent();
		});
		dataTypeCustomButton.addEventListener("click", () => {
			this.#config.datatypeAr = BrowsingDataType.Custom;
			dataTypePrivateButton.classList.remove("data-type-btn_active");
			dataTypeCustomButton.classList.add("data-type-btn_active");
			this.showDatatypeSubcontent();
			this.setCleanupBtnContent();
		});
		dataTypeButtons.appendChild(dataTypePrivateButton);
		dataTypeButtons.appendChild(dataTypeCustomButton);
		dataType.appendChild(dataTypeTitle);
		dataType.appendChild(dataTypeButtons);

		this.privateDataDescription = document.createElement("div");
		this.privateDataDescription.className = "private-data-description";

		const iconWrapper = document.createElement("div");
		const privateDataDescriptionIcon = new Icon({ href: "./assets/icons.svg#info-icon", className: "info-icon" });
		const privateDataDescriptionText = document.createElement("div");
		privateDataDescriptionText.className = "private-data-description_text";
		privateDataDescriptionText.innerText = chrome.i18n.getMessage("browsing_cleanup_private_data_description");
		iconWrapper.appendChild(privateDataDescriptionIcon.node);
		this.privateDataDescription.appendChild(iconWrapper);
		this.privateDataDescription.appendChild(privateDataDescriptionText);

		this.customOptions = document.createElement("div");
		this.customOptions.appendChild(
			new BrowserCleanupDataCheckboxes({
				checkedOptions: this.#config.customArOptions,
				onChange: (newPermissions) => {
					this.#config.customArOptions = { ...newPermissions };
					this.setCleanupBtnContent();
				},
				className: "reguar-cleanup-checkboxes",
			}).node,
		);

		this.showDatatypeSubcontent();

		const cleanupBtnContainer = document.createElement("div");
		cleanupBtnContainer.className = "cleanup-btn-container";

		this.cleanupBtn = document.createElement("button");
		this.cleanupBtn.className = "cleanup-btn";

		this.cleanupBtnSpin = document.createElement("span");
		this.cleanupBtnSpin.className = "rotating-circle";

		this.cleanupBtnText = document.createElement("span");

		this.cleanupBtn.appendChild(this.cleanupBtnSpin);
		this.cleanupBtn.appendChild(this.cleanupBtnText);
		this.setCleanupBtnContent();
		this.cleanupBtn.addEventListener("click", this.onCleanupBtnClick);
		cleanupBtnContainer.appendChild(this.cleanupBtn);

		this.element.appendChild(popupHeader.node);
		this.element.appendChild(timeRange);
		this.element.appendChild(dataType);
		this.element.appendChild(this.privateDataDescription);
		this.element.appendChild(this.customOptions);
		this.element.appendChild(cleanupBtnContainer);
	};
}
