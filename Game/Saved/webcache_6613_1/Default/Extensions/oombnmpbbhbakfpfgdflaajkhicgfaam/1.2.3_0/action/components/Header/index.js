class Header extends BaseComponent {
	/**
	 * @param {Object} props
	 * @param {string} props.title
	 * @param {string} props.subtitle
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = "header";

		const logo = new Icon({
			href: "../../assets/icons.svg#inline-logo",
			className: "header__logo"
		});

		this.element.appendChild(logo.node);

		if (this.props.title) {
			const title = document.createElement("h1");
			title.className = "header__title";
			getDomElementsFromString(this.props.title).forEach((element) => {
				title.appendChild(element);
			});

			this.element.appendChild(title);
		}

		if (this.props.subtitle) {
			const subtitle = document.createElement("div");
			subtitle.className = "header__subtitle";
			getDomElementsFromString(this.props.subtitle).forEach((element) => {
				subtitle.appendChild(element);
			});

			this.element.appendChild(subtitle);
		}

		this.node.appendChild(this.element);
	}
}
