const safetyIconStyleSheet = new CSSStyleSheet();

const safetyIconStylesCSS = /*CSS*/ `
.icon-img {
    height: 22px;
    width: 22px;
    margin-right: 5px;
    margin-left: 5px;
}

.icon-container {
    z-index: 2;
    position: relative;
    cursor: pointer;
    visibility: visible;
    display: inline-flex;
}

.icon-ad-container {
    z-index: 2;
    position: relative;
    cursor: pointer;
    top: 18px;
    display: inline-flex;
}

.icon-img-wrapper {
    display: inline-flex;
    align-items: center;
}
`;

safetyIconStyleSheet.replaceSync(safetyIconStylesCSS);
