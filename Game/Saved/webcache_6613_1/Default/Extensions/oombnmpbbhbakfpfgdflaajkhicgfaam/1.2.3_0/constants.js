const DelayLimit = 2147483647;

const ProtectionStatus = {
	Protected: 1,
	RestartRequired: 2,
	UnsupportedBrowser: 3,
	LicenseExpired: 4,
	MissingProduct: 5,
	ConnectionLost: 6,
};

const ProductCode = {
	InternetSecurity: "eis",
	SmartSecurityPremium: "essp",
	SecurityUltimate: "esu",
	SmallBusinessSecurity: "esbs",
};

const ProductMap = new Map([
	[ProductCode.InternetSecurity, { name: "ESET Internet Security", privacy: false }],
	[ProductCode.SmartSecurityPremium, { name: "ESET Smart Security Premium", privacy: false }],
	[ProductCode.SecurityUltimate, { name: "ESET Security Ultimate", privacy: true }],
	[ProductCode.SmallBusinessSecurity, { name: "ESET Small Business Security", privacy: true }],
]);

const DefaultLang = "en-US";
const LangMap = new Map([
	["ar", "ar-EG"],
	["bg", "bg-BG"],
	["ca", "ca-ES"],
	["ca-valencia", "ca-ES"],
	["cs", "cs-CZ"],
	["de", "de-DE"],
	["da", "da-DK"],
	["es-cl", "es-CL"],
	["es", "es-ES"],
	["el", "el-GR"],
	["en", "en-US"],
	["en-jm", "en-JM"],
	["et", "et-EE"],
	["fi", "fi-FI"],
	["fr-ca", "fr-CA"],
	["fr", "fr-FR"],
	["he", "he-IL"],
	["hr", "hr-HR"],
	["hu", "hu-HU"],
	["hy", "hy-AM"],
	["it", "it-IT"],
	["id", "id-ID"],
	["ja", "ja-JP"],
	["kk", "kk-KZ"],
	["ko", "ko-KR"],
	["lt", "lt-LT"],
	["lv", "lv-LV"],
	["nb", "nb-NO"],
	["nl", "nl-NL"],
	["pl", "pl-PL"],
	["pt", "pt-BR"],
	["ro", "ro-RO"],
	["ru", "ru-RU"],
	["sk", "sk-SK"],
	["sl", "sl-SI"],
	["sr", "sr-Latn-RS"],
	["sv", "sv-SE"],
	["th", "th-TH"],
	["tr", "tr-TR"],
	["uk", "uk-UA"],
	["vi", "vi-VN"],
	["zh", "zh-CN"],
	["zh-tw", "zh-TW"],
]);

const longWordLangs = [
	"bg",
	"ca",
	"ca-valencia",
	"de",
	"el",
	"es-ES",
	"es-MX",
	"fr",
	"it",
	"pt-BR",
	"ro",
	"ru",
	"sr",
	"tr",
	"uk",
];

const BrowsingDataType = { Unselected: 0, Private: 1, Custom: 2 };

const BrowserCleanupPeriod = {
	Unselected: 0,
	All: 1,
	BrowsingSession: 2,
	Hour: 3,
	Day: 4,
	Week: 5,
	Month: 6,
};

const AllUrls = "<all_urls>";

const SitePermission = {
	Ask: "ask",
	Allow: "allow",
	Block: "block",
	Reset: "reset",
};

const InvalidTabId = -1;

const WebsiteScanStatus = { Unknown: -1, Ok: 0, Block: 1 };

const StorageKey = {
	WebsiteScanBlockList: "websiteScanBlockList",
	WebsiteScanIgnoreList: "websiteScanIgnoreList",
};
