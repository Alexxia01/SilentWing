const stateIndicatorIconStylesCSS = /*CSS*/ `
:host {
    --default-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/default.svg")});
    --notifying-frame1: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/notifying_frame1.svg")});
    --notifying-frame2: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/notifying_frame2.svg")});
    --loading-frame: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/loader_frame.svg")});
    --loading-arc: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/loader_arc.svg")});
    --good-result-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/result_good.svg")});
    --warning-result-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/result_warn.svg")});
    --bad-result-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/result_bad.svg")});
}

.dark-mode {
    --notifying-frame1: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/notifying_frame1_dark-mode.svg")});
    --notifying-frame2: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/notifying_frame2_dark-mode.svg")});
    --loading-frame: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/loader_frame_dark-mode.svg")});
    --good-result-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/result_good_dark-mode.svg")});
    --warning-result-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/result_warn_dark-mode.svg")});
    --bad-result-icon: url(${chrome.runtime.getURL("contentScripts/llmScan/ui/assets/result_bad_dark-mode.svg")});
}

.state-indicator {
    display: flex;
    position: absolute;
    bottom: 0;
    background-size: contain;
    background-repeat: no-repeat;
    width: 32px;
    height: 32px;
    margin-left: 24px;
    margin-bottom: 12px;
}

.state-indicator[data-state="default"] {
    width: 30px;
    height: 30px;
    background-image: var(--default-icon);
}

.state-indicator[data-state="notifying"] {
    width: 76px;
    height: 76px;
    cursor: pointer;
    background-image: var(--notifying-frame1);
    animation: icon-pulse 1.5s steps(3) infinite;
    margin-left: 12px;
    margin-bottom: 0;
    transform: translateY(10px);
}

.state-indicator[data-state="scanning"] {
    background-image: var(--loading-frame);
}

.state-indicator[data-state="scanning"]::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--loading-arc);
    background-size: contain;
    background-repeat: no-repeat;
    animation: icon-spin 1400ms linear infinite;
}

.state-indicator[data-state="good-result"] {
    background-image: var(--good-result-icon);
}

.state-indicator[data-state="warning-result"] {
    background-image: var(--warning-result-icon);
}

.state-indicator[data-state="bad-result"] {
    background-image: var(--bad-result-icon);
}

@keyframes icon-spin {
    0% {
        animation-timing-function: linear;
        transform: rotate(0deg);
    }

    14.29% {
        animation-timing-function: linear;
        transform: rotate(90deg);
    }

    28.57% {
        animation-timing-function: linear;
        transform: rotate(180deg);
    }

    42.86% {
        animation-timing-function: cubic-bezier(0, 0.8, 0.45, 0.45);
        transform: rotate(270deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes icon-pulse {
    0% {
        background-image: var(--notifying-frame1);
    }

    33% {
        background-image: var(--notifying-frame2);
    }

    66% {
        background-image: var(--notifying-frame1);
    }
}
`;
