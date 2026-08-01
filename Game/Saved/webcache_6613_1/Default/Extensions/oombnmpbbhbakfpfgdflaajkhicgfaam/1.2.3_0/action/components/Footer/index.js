class Footer extends BaseComponent {
	/**
	 * @param {Object} props
	 */
	constructor(props) {
		super(props);

		this.render();
	}

	replaceWithCurrentYear(string) {
		return string.replace("%YEAR%", new Date().getFullYear());
	}

	render() {
		this.element = document.createElement("div");
		this.element.className = "footer container";

		const hr = document.createElement("hr");
		hr.className = "footer__line";

		const copyrightSection = document.createElement("div");
		copyrightSection.className = "footer__copyright-section";
		copyrightSection.innerText = this.replaceWithCurrentYear(chrome.i18n.getMessage("info_page_footer"));

		this.element.appendChild(hr);
		this.element.appendChild(copyrightSection);
		this.node.appendChild(this.element);
	}
}
