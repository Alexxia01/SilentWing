class Tooltip extends BaseComponent {
	static defaultProps = {
		disabled: false
	};

	/**
	 * @param {Object} props
	 * @param {HTMLElement} props.child
	 * @param {HTMLElement} props.content
	 * @param {string} props.className
	 * @param {boolean} props.disabled
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	componentDidUpdateProps(key, prevValue) {
		if (key === "disabled") {
			this.element.dataset.showTooltip = !this.props.disabled;
		}
	}

	render() {
		const tooltip = document.createElement("div");
		this.element = tooltip;

		tooltip.className = "tooltip";

		if (this.props.className) {
			tooltip.classList.add(this.props.className);
		}

		tooltip.dataset.showTooltip = !this.props.disabled;

		tooltip.appendChild(this.props.child);

		const tooltipContent = document.createElement("div");
		tooltipContent.className = "tooltip-content";
		tooltipContent.appendChild(this.props.content);
		tooltip.appendChild(tooltipContent);

		this.node.appendChild(tooltip);
	}
}
