"use strict";

const isChrome = /chrome/i.test(navigator.userAgent);

const mainContainer = document.querySelector(".main-container");

mainContainer.appendChild(new RegularCleanupSettings().node);
