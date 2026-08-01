class BaseScanner {
	constructor(type) {
		this.type = type;
	}

	async scan(element) {
		throw new Error("scan() must be implemented by subclass");
	}

	getElementContainer(element, containerSelectors) {
		let container = element;

		for (const selector of containerSelectors) {
			const containerEl = element.closest(selector);

			if (containerEl) {
				container = containerEl;
				break;
			}
		}

		return container;
	}
}
