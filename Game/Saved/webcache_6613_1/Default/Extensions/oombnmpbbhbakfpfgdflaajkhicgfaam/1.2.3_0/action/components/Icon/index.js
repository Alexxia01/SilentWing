class Icon extends BaseComponent {
	/**
	 * @param {Object} props
	 * @param {string} props.href
	 * @param {string} props.className
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	componentDidUpdateProps(key, prevValue) {
		if (key === "className") {
			this.setClassList();
		}
	}

	setClassList = () => {
		if (!this.props.className) {
			return;
		}

		this.element.setAttribute("class", this.props.className);
	};

	render() {
		this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.setClassList();

		const useElement = document.createElementNS("http://www.w3.org/2000/svg", "use");
		useElement.setAttribute("href", this.props.href);

		this.element.appendChild(useElement);

		this.node.appendChild(this.element);
	}
}
