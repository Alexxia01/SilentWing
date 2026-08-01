class UrlScanner extends BaseScanner {
	constructor() {
		super(DETECTION_TYPE.urls);
	}

	async scan(element) {
		const urlMap = new Map();

		const anchorElements = element.querySelectorAll("a");

		anchorElements.forEach((el) => {
			const href = el.getAttribute("href");

			if (href) {
				if (!urlMap.has(href)) {
					urlMap.set(href, []);
				}

				urlMap.get(href).push(el);

				return;
			}

			const text = el.textContent.trim();

			if (text) {
				try {
					const url = new URL(text);

					if (url.protocol === "http:" || url.protocol === "https:") {
						if (!urlMap.has(text)) {
							urlMap.set(text, []);
						}

						urlMap.get(text).push(el);
					}
				} catch (e) {}
			}
		});

		return urlMap;
	}
}
