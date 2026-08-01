async function injectSVGSprite() {
	const response = await fetch(chrome.runtime.getURL("action/assets/icons.svg"));
	const text = await response.text();

	const [div] = getDomElementsFromString(`<div style="display:none">${text}</div>`);

	document.body.insertBefore(div, document.body.firstChild);
}

injectSVGSprite();
