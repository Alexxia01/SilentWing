const permissionCurrentState = {};
const permissionInitialState = {};
const { contentSettings } = chrome;

class SiteSettingSelect extends BaseComponent {
	#options = {
		blocked: {
			value: SitePermission.Block,
			label: chrome.i18n.getMessage("settings_page_website_settings_blocked_text"),
			selected: true
		},
		allowed: {
			value: SitePermission.Allow,
			label: chrome.i18n.getMessage("settings_page_website_settings_allowed_text"),
			selected: true
		},
		block: {
			value: SitePermission.Block,
			label: chrome.i18n.getMessage("settings_page_website_settings_block_text"),
			selected: false
		},
		allow: {
			value: SitePermission.Allow,
			label: chrome.i18n.getMessage("settings_page_website_settings_allow_text"),
			selected: false
		},
		resetToBlock: {
			value: SitePermission.Reset,
			label: chrome.i18n.getMessage("settings_page_website_settings_reset_to_block_text"),
			selected: false
		},
		resetToAllow: {
			value: SitePermission.Reset,
			label: chrome.i18n.getMessage("settings_page_website_settings_reset_to_allow_text"),
			selected: false
		}
	};

	/**
	 * @param {Object} props
	 * @param {string} props.type
	 * @param {string} props.url
	 * @param {string} props.initialValue
	 */
	constructor(props) {
		super(props);

		this.init();
	}

	componentDidUpdateProps = (key, prevValue) => {
		if (key !== "type" || key !== "url" || key !== "initialValue") {
			return;
		}

		this.init();
	};

	init = () => {
		if (!this.props.type || !this.props.url) {
			

			return;
		}

		if (!permissionInitialState[this.props.type]) {
			permissionInitialState[this.props.type] = {};
		}

		permissionInitialState[this.props.type][this.props.url] = this.props.initialValue;

		if (!permissionCurrentState[this.props.type]) {
			permissionCurrentState[this.props.type] = {};
		}

		this.customSelect = new CustomSelect();

		contentSettings[this.props.type].get({ primaryUrl: this.props.url }).then((value) => {
			permissionCurrentState[this.props.type][this.props.url] = value.setting;
			this.customSelect.props.options = this.getPermissionSelectOptions(this.props.initialValue, value.setting);
		});

		this.render();
		this.node.append(this.customSelect.node);
	};

	getPermissionSelectOptions = (initialState, currentState) => {
		const options = [];

		switch (currentState) {
			case SitePermission.Block:
				options.push({ ...this.#options.blocked });

				if (initialState !== currentState) {
					options.push({ ...this.#options.resetToAllow });
				} else {
					options.push({ ...this.#options.allow });
				}

				break;
			case SitePermission.Allow:
				options.push({ ...this.#options.allowed });

				if (initialState !== currentState) {
					options.push({ ...this.#options.resetToBlock });
				} else {
					options.push({ ...this.#options.block });
				}

				break;
			default:
				break;
		}

		return options;
	};

	onSelect = async (option) => {
		try {
			if (option.value === SitePermission.Reset) {
				await this.resetSitePermission();
			} else {
				await contentSettings[this.props.type].set({
					primaryPattern: this.props.url,
					setting: option.value
				});
			}
		} catch (error) {
			
		}

		const currentValue = option.value === SitePermission.Reset ? this.props.initialValue : option.value;
		const updatedOptions = this.getPermissionSelectOptions(this.props.initialValue, currentValue);

		permissionCurrentState[this.props.type][this.props.url] = currentValue;

		this.customSelect.props.options = updatedOptions;
	};

	resetSitePermission = async () => {
		try {
			await contentSettings[this.props.type].clear({ scope: "regular" });

			for (const url in permissionCurrentState[this.props.type]) {
				if (
					url !== this.props.url &&
					!url.includes("chrome-extension://") &&
					permissionCurrentState[this.props.type][url] !== permissionInitialState[this.props.type][url]
				) {
					await contentSettings[this.props.type].set({
						primaryPattern: url,
						setting: permissionCurrentState[this.props.type][url]
					});
				}
			}
		} catch (error) {
			
		}
	};

	render = () => {
		const disabled = this.props.url.includes("chrome-extension://");
		const currentSetting = permissionCurrentState[this.props.type][this.props.url];
		const options = this.getPermissionSelectOptions(this.props.initialValue, currentSetting);

		this.customSelect.props.options = options;
		this.customSelect.props.disabled = disabled;
		this.customSelect.props.onSelect = this.onSelect;
	};
}
