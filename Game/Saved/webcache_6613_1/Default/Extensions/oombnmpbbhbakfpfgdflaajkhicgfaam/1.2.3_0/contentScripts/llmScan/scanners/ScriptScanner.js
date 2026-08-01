class ScriptScanner extends BaseScanner {
	constructor(selector, containerSelector) {
		super(DETECTION_TYPE.scripts);

		if (!selector) {
			throw new Error("ScriptScanner requires a selector for code blocks");
		}

		if (!containerSelector) {
			throw new Error("ScriptScanner requires a container selector for code blocks");
		}

		this.selector = selector;
		this.containerSelector = containerSelector;
	}

	async scan(element) {
		const scriptMap = new Map();
		const codeBlocks = element.querySelectorAll(this.selector);

		codeBlocks.forEach((el) => {
			const code = el.textContent;

			if (!code) {
				return;
			}

			if (!scriptMap.has(code)) {
				scriptMap.set(code, []);
			}

			const codeBlockContainer = this.getElementContainer(el, this.containerSelector);

			scriptMap.get(code).push(codeBlockContainer);
		});

		return scriptMap;
	}
}
