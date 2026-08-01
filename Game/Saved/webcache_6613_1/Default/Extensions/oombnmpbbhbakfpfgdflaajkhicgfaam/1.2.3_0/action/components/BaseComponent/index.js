class BaseComponent {
	static defaultProps = {};

	node = document.createDocumentFragment();

	/**
	 * @param {Object} props
	 */
	constructor(props) {
		this.props = new Proxy(
			{ ...this.constructor.defaultProps, ...props },
			{
				set: (target, key, value) => {
					const prevValue = this.props[key];

					if (value !== prevValue) {
						target[key] = value;

						this.componentDidUpdateProps(key, prevValue);
					}

					return true;
				}
			}
		);
	}

	componentDidUpdateProps(key, prevValue) {}
}
