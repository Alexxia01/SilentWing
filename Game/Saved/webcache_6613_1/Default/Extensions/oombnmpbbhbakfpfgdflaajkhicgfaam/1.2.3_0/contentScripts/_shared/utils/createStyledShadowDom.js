function createStyledShadowDom(styles) {
	const shadowHost = document.createElement("div");
	const shadowRoot = shadowHost.attachShadow({ mode: "open" });

	shadowHost.className = "bpsShadowHost";

	// TODO: Check if the bug with adoptedStyleSheets in Firefox was fixed. https://bugzilla.mozilla.org/show_bug.cgi?id=1751346
	if (IS_CHROME) {
		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(styles);

		shadowRoot.adoptedStyleSheets = [styleSheet];
	} else {
		const innerStyles = document.createElement("style");

		innerStyles.innerText = styles;
		shadowRoot.appendChild(innerStyles);
	}

	return [shadowHost, shadowRoot];
}
