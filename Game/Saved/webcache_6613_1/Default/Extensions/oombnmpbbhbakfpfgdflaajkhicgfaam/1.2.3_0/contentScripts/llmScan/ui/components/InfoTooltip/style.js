const infoTooltipStylesCSS = /*CSS*/ `
:host {
    --border-color: #00bbc5;
    --link-color: #187daf;
    --close-button: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/close-button.svg")});
    --external-link-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/external-link.svg")});
}

.dark-mode {
    --close-button: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/close-button_dark-mode.svg")}); 
    --link-color: #4cafe1;
    --border-color: #00c7d1;
    --external-link-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/external-link_dark-mode.svg")});
}

.info-tooltip {
    width: 299px;
    padding: 12px;
}

.info-popup__header {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 12px;
}

.info-popup__title-logo {
    width: 267px;
}

.info-popup__close-btn {
    width: 12px;
    height: 12px;
    background-image: var(--close-button);
    cursor: pointer;
}

.info-popup__body {
    font-family: "Segoe UI";
    font-size: 14px;
    font-weight: 400;
    border: none;
    margin: 0px;
    padding: 0px;
}

.onboarding-info {
    margin: 0;
}

.onboarding-info:first-child {
    margin-bottom: 8px;
}

.onboarding-info:last-child {
    margin-bottom: 12px;
}

.extension-popup-link,
.info-popup__external-link {
    font-family: "Segoe UI";
    font-weight: 600;
    font-size: 14px;

    display: inline-block;
    color: var(--link-color);
    text-decoration: none;

    cursor: pointer;
}

.info-popup__external-link-icon {
    display: inline-flex;
    width: 12px;
    height: 12px;
    margin-left: 8px;
    vertical-align: middle;
    background-image: var(--external-link-icon);
    background-repeat: no-repeat;
}
`;
