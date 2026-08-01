const tooltipStylesCSS = /*CSS*/ `
:host {
    --light-bg: #ffffff;
    --dark-bg: #363638;
    --light-text: #373c42;
    --dark-text: #e8ecee;
    --shadow-color: #00000026;
    --border-color: var(--light-border);
}

/* The popup styles*/
.popup {
    display: block;
    border-radius: 3px;
    position: absolute;
    z-index: 100;
    box-shadow: 0px 6px 15px 0px var(--shadow-color);
    min-width: 100px;
    border: solid 2px;
    border-color: var(--border-color);
}

.light-mode.popup {
    background-color: var(--light-bg);
    color: var(--light-text);
}

.dark-mode.popup {
    background-color: var(--dark-bg);
    color: var(--dark-text);
}

.popup-hidden {
    display: none;
}

/* Popup arrow */
.popup::before {
    content: "";
    position: absolute;
    z-index: 101;
    top: 50%;
    left: -6.5px;
    margin-top: -4.8px;
    width: 8.05px;
    height: 8.05px;
    border-left: solid 2px;
    border-bottom: solid 2px;
    border-color: var(--border-color);
    transform: rotate(45deg);
    pointer-events: none;
}

.light-mode.popup::before {
    background-color: var(--light-bg);
}

.dark-mode.popup::before {
    background-color: var(--dark-bg);
}

:dir(rtl).popup::before{
    right: -6.5px;
    transform: rotate(225deg);
}

/* Flipped: tooltip is shown to the left of target — arrow moves to the right */
.popup.popup--flipped::before {
    left: unset;
    right: -6.5px;
    transform: rotate(225deg);
}

/* RTL + flipped: tooltip is shown to the right of target — restore left arrow */
:dir(rtl).popup.popup--flipped::before {
    right: unset;
    left: -6.5px;
    transform: rotate(45deg);
}
`;
