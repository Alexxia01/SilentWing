const RobotoFont = new FontFace("Roboto", "url('./assets/fonts/Roboto-Regular.ttf')");
document.fonts.add(RobotoFont);

function setTheme() {
	if (localStorage.getItem("isDarkMode") === "true") {
		document.documentElement.classList.add("dark-mode");

		return;
	}

	document.documentElement.classList.remove("dark-mode");
}

if (!localStorage.getItem("isDarkMode")) {
	chrome.storage.local.get("cfg", (data) => {
		localStorage.setItem("isDarkMode", Boolean(data.cfg?.darkMode));
		setTheme();
	});
} else {
	setTheme();
}

const lang = chrome.i18n.getUILanguage();

if (lang === "el") {
	document.documentElement.style.setProperty("--custom-input-margin", "0px");
}
