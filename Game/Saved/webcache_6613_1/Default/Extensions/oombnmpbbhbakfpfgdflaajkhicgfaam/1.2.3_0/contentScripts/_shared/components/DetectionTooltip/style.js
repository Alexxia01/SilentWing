const detectionStatusTooltipStylesCSS = /*CSS*/ `
:host {
    --green-border: #659d15;
    --yellow-border: #fbbf01;
    --red-border: #de342b;
}

[data-status="bad"] {
    --border-color: var(--red-border);
}

[data-status="warning"] {
    --border-color: var(--yellow-border);
}

[data-status="good"] {
    --border-color: var(--green-border);
}

.popup-content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 10px;
    max-width: 316px;
}

.popup-img {
    width: 43px;
    height: 18px;
}

.popup-text {
    font-family: "Segoe UI", Roboto, "Open Sans", -apple-system, BlinkMacSystemFont, Ubuntu, Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    margin: 0px;
    padding: 0px;
}
`;
