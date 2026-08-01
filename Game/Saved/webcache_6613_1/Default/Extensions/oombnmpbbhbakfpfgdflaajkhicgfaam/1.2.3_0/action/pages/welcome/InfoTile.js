class InfoTile extends BaseComponent {
	#icons = {
		[Browser.Chrome]: {
			extensionIconSrc: "../../assets/icons.svg#plugin-chrome",
			extensionIconClassName: "info-tile__plugin-chrome",
			pinIconSrc: "../../assets/icons.svg#pin-chrome",
			pinIconClassName: "info-tile__pin-chrome"
		},
		[Browser.Firefox]: {
			extensionIconSrc: "../../assets/icons.svg#plugin-firefox",
			extensionIconClassName: "info-tile__plugin-firefox",
			pinIconSrc: "../../assets/icons.svg#pin-firefox",
			pinIconClassName: "info-tile__pin-firefox"
		},
		[Browser.Edge]: {
			extensionIconSrc: "../../assets/icons.svg#plugin-edge",
			extensionIconClassName: "info-tile__plugin-edge",
			pinIconSrc: "../../assets/icons.svg#pin-edge",
			pinIconClassName: "info-tile__pin-edge"
		},
		[Browser.Brave]: {
			extensionIconSrc: "../../assets/icons.svg#plugin-brave",
			extensionIconClassName: "info-tile__plugin-brave",
			pinIconSrc: "../../assets/icons.svg#pin-chrome",
			pinIconClassName: "info-tile__pin-chrome"
		}
	};

	/**
	 * @param {Object} props
	 * @param {number} props.browser
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = "info-tile";

		const iconsSection = document.createElement("div");
		iconsSection.className = "info-tile__icons-section";

		const extensionIcon = new Icon({
			href: this.#icons[this.props.browser].extensionIconSrc,
			className: this.#icons[this.props.browser].extensionIconClassName
		});

		const arrowIcon = new Icon({
			href: "../../assets/icons.svg#arrow-right",
			className: "info-tile__arrow-icon"
		});

		const pinIcon = new Icon({
			href: this.#icons[this.props.browser].pinIconSrc,
			className: this.#icons[this.props.browser].pinIconClassName
		});

		const message = document.createElement("div");
		message.className = "info-tile__message";
		message.innerText = chrome.i18n.getMessage("welcome_page_chrome_info_tile_text");

		iconsSection.appendChild(extensionIcon.node);
		iconsSection.appendChild(arrowIcon.node);
		iconsSection.appendChild(pinIcon.node);
		this.element.appendChild(iconsSection);
		this.element.appendChild(message);
		this.node.appendChild(this.element);
	}
}
