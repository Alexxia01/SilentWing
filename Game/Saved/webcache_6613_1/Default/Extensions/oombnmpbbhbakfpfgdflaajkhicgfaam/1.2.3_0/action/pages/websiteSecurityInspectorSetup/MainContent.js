class MainContent extends BaseComponent {
	/**
	 * @param {Object} props
	 */
	constructor(props) {
		super(props);

		this.init();
	}

	init() {
		this.element = document.createElement("div");
		this.almostDoneContent = new AlmostDoneSection({ isVisible: false });
		this.successContent = new AllSetSection({ isVisible: false });

		chrome.storage.local.get("cfg").then(({ cfg: config }) => {
			this.setSectionVisibility(config.permissions);
		});

		chrome.storage.onChanged.addListener((changes, area) => {
			const newConfig = changes.cfg?.newValue;

			if (!newConfig || area !== "local") {
				return;
			}

			this.setSectionVisibility(newConfig.permissions);
		});

		this.render();
	}

	setSectionVisibility(isPermissionGranted) {
		this.almostDoneContent.props.isVisible = !isPermissionGranted;
		this.successContent.props.isVisible = isPermissionGranted;
	}

	render() {
		this.element.classList.add("main-content", "container");

		this.element.appendChild(this.almostDoneContent.node);
		this.element.appendChild(this.successContent.node);
		this.node.appendChild(this.element);
	}
}
