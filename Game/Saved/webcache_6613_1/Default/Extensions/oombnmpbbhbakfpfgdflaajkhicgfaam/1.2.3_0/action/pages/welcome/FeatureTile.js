class FeatureTile extends BaseComponent {
	/**
	 * @param {Object} props
	 * @param {string} props.title
	 * @param {string} props.description
	 * @param {string} props.iconSrc
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = "feature-tile";

		const icon = new Icon({
			href: this.props.iconSrc,
			className: "feature-tile__icon"
		});

		const title = document.createElement("div");
		title.className = "feature-tile__title";
		title.innerText = this.props.title;

		const description = document.createElement("div");
		description.className = "feature-tile__description";
		description.innerText = this.props.description;

		this.element.appendChild(icon.node);
		this.element.appendChild(title);
		this.element.appendChild(description);
		this.node.appendChild(this.element);
	}
}
