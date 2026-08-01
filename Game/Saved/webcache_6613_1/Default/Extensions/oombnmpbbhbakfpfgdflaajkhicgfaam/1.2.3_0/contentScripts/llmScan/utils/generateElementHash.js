async function generateElementHash(element) {
	let text = element.textContent;

	element.querySelectorAll("a[href]").forEach((a) => {
		text += a.getAttribute("href");
	});

	const encoded = new TextEncoder().encode(text);
	const buffer = await crypto.subtle.digest("SHA-256", encoded);

	return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}
