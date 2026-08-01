class PopupHeader extends BaseComponent {
	/**
	 * @param {Object} props
	 * @param {string} props.title
	 * @param {string} props.description
	 * @param {string} props.className
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = `popup-header ${this.props.className || ""}`;

		const title = document.createElement("h3");
		title.className = "popup-header_title";
		title.textContent = this.props.title;

		const description = document.createElement("div");
		description.className = "popup-header_description";
		description.textContent = this.props.description;

		this.element.appendChild(title);
		this.element.appendChild(description);
		this.node.appendChild(this.element);
	}
}
