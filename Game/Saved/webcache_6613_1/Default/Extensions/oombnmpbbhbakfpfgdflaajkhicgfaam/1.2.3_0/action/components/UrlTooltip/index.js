class UrlTooltip extends BaseComponent {
	/**
	 * @param {Object} props
	 * @param {HTMLElement} props.child
	 * @param {string} props.url
	 * @param {string} props.className
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	getWidth = (elem) => {
		return getComputedStyle(elem).width.slice(0, -2);
	};

	render = () => {
		const urlTooltip = new Tooltip({
			child: this.props.child,
			content: document.createTextNode(this.props.url),
			className: this.props.className
		});

		this.node.appendChild(urlTooltip.node);

		const resizeObserver = new ResizeObserver(([entity]) => {
			const { target: element } = entity;
			let originalWidth;

			if (element.dataset.originalWidth) {
				originalWidth = element.dataset.originalWidth;
			} else {
				const clone = element.cloneNode(true);

				clone.style.position = "absolute";
				clone.style.width = "auto";
				clone.style.visibility = "hidden";
				clone.style.overflow = "visible";
				document.body.appendChild(clone);

				originalWidth = this.getWidth(clone);
				element.dataset.originalWidth = originalWidth;
				document.body.removeChild(clone);
			}

			const currentWidth = this.getWidth(element);
			const isOverflowing = +currentWidth < +originalWidth;

			if (isOverflowing) {
				urlTooltip.props.disabled = false;
			} else {
				urlTooltip.props.disabled = true;
			}
		});

		resizeObserver.observe(this.props.child);
	};
}
