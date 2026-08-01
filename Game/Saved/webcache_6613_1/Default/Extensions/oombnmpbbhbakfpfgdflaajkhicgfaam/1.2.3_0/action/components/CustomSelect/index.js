class CustomSelect extends BaseComponent {
	static defaultProps = {
		options: [],
		onSelect: null,
		disabled: false
	};

	/**
	 * @param {Object} props
	 * @param {string} props.placeholder
	 * @param {Array<{ value: string; label: string; selected: boolean; }>} props.options
	 * @param {(option: { value: string; label: string; selected: boolean; }) => void} props.onSelect
	 * @param {boolean} props.disabled
	 */
	constructor(props) {
		super(props);

		this.init();
	}

	get selectedOption() {
		return this.props.options.find((option) => option.selected);
	}

	get selectedOptionIndex() {
		return this.props.options.indexOf(this.selectedOption);
	}

	init = () => {
		this.customElement = document.createElement("div");
		this.labelElement = document.createElement("span");
		this.optionsCustomElement = document.createElement("ul");

		this.debounceTimeout = null;
		this.searchTerm = "";

		this.render();

		this.node.append(this.customElement);
	};

	componentDidUpdateProps = (key, prevValue) => {
		switch (key) {
			case "options":
				this.updateLabel();
				this.renderOptions();

				break;
			case "onSelect":
				this.renderOptions();

				break;
			case "disabled":
				this.labelElement.classList.toggle("custom-select-value_disabled", this.props.disabled);

				if (!this.props.disabled) {
					this.renderOptions();
				} else {
					this.optionsCustomElement.innerText = "";
					this.removeEventHandlers();
				}

				break;
			default:
				break;
		}
	};

	closeOptions = () => {
		this.customElement.classList.remove("custom-select_active");
		this.optionsCustomElement.classList.remove("custom-select-options_shown");
	};

	toggleShowingOptions = () => {
		this.customElement.classList.toggle("custom-select_active");
		this.optionsCustomElement.classList.toggle("custom-select-options_shown");
	};

	onKeydownHandler = (e) => {
		switch (e.code) {
			case "Enter":
				this.toggleShowingOptions();

				break;
			case "Space":
				this.customElement.classList.add("custom-select_active");
				this.optionsCustomElement.classList.add("custom-select-options_shown");

				break;
			case "ArrowUp": {
				const prevOption = this.props.options[this.selectedOptionIndex - 1];

				if (prevOption) {
					this.selectValue(prevOption);
				}

				break;
			}
			case "ArrowDown": {
				const nextOption = this.props.options[this.selectedOptionIndex + 1];

				if (nextOption) {
					this.selectValue(nextOption);
				}

				break;
			}
			case "Escape":
				this.closeOptions();

				break;
			default: {
				clearTimeout(this.debounceTimeout);
				this.searchTerm += e.key;
				this.debounceTimeout = setTimeout(() => {
					this.searchTerm = "";
				}, 500);

				const searchedOption = this.props.options.find((option) =>
					option.label.toLowerCase().startsWith(this.searchTerm)
				);

				if (searchedOption) {
					this.selectValue(searchedOption);
				}
			}
		}
	};

	setEventHandlers = () => {
		this.labelElement.addEventListener("click", this.toggleShowingOptions);
		this.customElement.addEventListener("blur", this.closeOptions);
		this.customElement.addEventListener("keydown", this.onKeydownHandler);
	};

	removeEventHandlers = () => {
		this.labelElement.removeEventListener("click", this.toggleShowingOptions);
		this.customElement.removeEventListener("blur", this.closeOptions);
		this.customElement.removeEventListener("keydown", this.onKeydownHandler);
	};

	selectValue = (option) => {
		const newSelectedOption = option;
		const prevSelectedOption = this.selectedOption;

		if (prevSelectedOption) {
			prevSelectedOption.selected = false;
		}

		newSelectedOption.selected = true;

		this.updateLabel();

		if (prevSelectedOption) {
			const prevSelectedElement = this.optionsCustomElement.querySelector(`[data-value="${prevSelectedOption.value}"]`);
			prevSelectedElement.classList.remove("selected");
		}

		const newSelectedElement = this.optionsCustomElement.querySelector(`[data-value="${newSelectedOption.value}"]`);
		newSelectedElement.classList.add("selected");

		this.props.onSelect?.(option);
	};

	updateLabel = () => {
		this.labelElement.innerText = this.selectedOption?.label || this.props.placeholder;
	};

	renderOptions = () => {
		this.optionsCustomElement.innerText = "";

		if (this.props.disabled) {
			return;
		}

		this.props.options.forEach((option) => {
			const optionElement = document.createElement("li");

			optionElement.classList.add("custom-select-option");
			optionElement.classList.toggle("selected", option.selected);
			optionElement.innerText = option.label;
			optionElement.dataset.value = option.value;
			optionElement.addEventListener("click", () => {
				this.selectValue(option);
				this.closeOptions();
			});

			this.optionsCustomElement.append(optionElement);
		});
	};

	render = () => {
		this.customElement.classList.add("custom-select");
		this.customElement.tabIndex = 0;

		this.labelElement.classList.add("custom-select-value");
		this.updateLabel();
		this.customElement.append(this.labelElement);

		this.optionsCustomElement.classList.add("custom-select-options");
		this.customElement.append(this.optionsCustomElement);

		if (this.props.disabled) {
			this.labelElement.classList.add("custom-select-value_disabled");

			return;
		}

		this.renderOptions();
		this.setEventHandlers();
	};
}
