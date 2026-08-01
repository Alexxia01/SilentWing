class Button extends BaseComponent {
	/**
	 * @param {Object} props
	 * @param {string} props.title
	 * @param {Function} props.onClick
	 * @param {"primary" | "secondary"} props.style
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	render() {
		this.element = document.createElement("button");
		this.element.className = `custom-button ${
			this.props.style === "secondary" ? "custom-button_secondary" : "custom-button_primary"
		}`;
		this.element.addEventListener("click", this.props.onClick);

		const title = document.createElement("span");
		title.className = "custom-button__title";
		title.innerText = this.props.title;

		this.element.appendChild(title);
		this.node.appendChild(this.element);
	}
}
