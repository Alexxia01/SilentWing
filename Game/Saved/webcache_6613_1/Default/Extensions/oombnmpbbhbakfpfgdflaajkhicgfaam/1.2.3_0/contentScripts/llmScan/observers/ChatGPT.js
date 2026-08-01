const interactionTypeBySelector = {
	"button[aria-label='Sources']": INTERACTION_TYPE.sources, // TODO: replace languege-specific aria-label with data attribute if possible
	"span[data-testid='webpage-citation-pill'], div[data-radix-popper-content-wrapper]": INTERACTION_TYPE.citationPill,
	"span.whitespace-normal": INTERACTION_TYPE.textLink,
	"div.animate-pulse, button[aria-label='Previous image'], button[aria-label='Next image']": INTERACTION_TYPE.image,
	"div[data-testid='businesses-map-widget']": INTERACTION_TYPE.map,
};

/**
 * ChatGPT-specific conversation observer
 */
class ConversationObserver extends BaseConversationObserver {
	static selectors = {
		codeBlocks: "#code-block-viewer",
		codeBlockContainer: ["[role='dialog']:has(#code-block-viewer)", "pre:has(#code-block-viewer)"],
	};

	name = PROVIDER_NAME.chatgpt;

	selectors = {
		newChatIdentifierContainer: "#thread",
		promptInputContainer: "#thread-bottom form",
		prompt: '[data-turn="user"]',
		response: '[data-turn="assistant"]',
		mainPageHeader: "h1 div.text-pretty, [data-splash-headline-option], h1.text-page-header",
		responseLoadedIndicator: '[data-testid="copy-turn-action-button"]',
		multipleResponseIndicator: "button[data-testid='paragen-prefer-response-button']",
		additionalContentList: [
			"div[slot='content']",
			"#modal-chat-screen-entity-flyout",
			"div[data-radix-popper-content-wrapper]",
			"#modal-image-gen-lightbox",
			"#modal-code-execution",
			"#modal-search-results",
		],
	};

	shouldScanNextResponse = false;

	constructor({ onNewConversation, onPageOpened, onResponseStarted, onError } = {}) {
		super({ onNewConversation, onPageOpened, onResponseStarted, onError });
	}

	isResponseComplete(responseNode) {
		if (
			responseNode.querySelector(this.selectors.responseLoadedIndicator) !== null ||
			responseNode.querySelectorAll(this.selectors.multipleResponseIndicator).length > 1
		) {
			return true;
		}

		return false;
	}

	detectAdditionalContent(addedNodes, removedNodes) {
		for (const node of addedNodes) {
			if (node.nodeType !== Node.ELEMENT_NODE) {
				continue;
			}

			const additionalContentSelectorsStr = this.selectors.additionalContentList.join(", ");
			const additionalContent = node.matches(additionalContentSelectorsStr)
				? node
				: node.querySelector(additionalContentSelectorsStr) || node.closest(additionalContentSelectorsStr) || null;

			if (!additionalContent) {
				continue;
			}

			return additionalContent;
		}

		return null;
	}

	detectNewConversation(addedNodes, removedNodes) {
		this.checkNavigationState(removedNodes);

		return this.checkForNewResponse(addedNodes);
	}

	/**
	 * Check if user navigated away from main page
	 */
	checkNavigationState(removedNodes) {
		for (const node of removedNodes) {
			if (node.nodeType !== Node.ELEMENT_NODE || !node.querySelector(this.selectors.mainPageHeader)) {
				continue;
			}

			this.shouldScanNextResponse = true;
			return;
		}
	}

	checkForNewResponse(addedNodes) {
		for (const node of addedNodes) {
			if (node.nodeType !== Node.ELEMENT_NODE) {
				continue;
			}

			if (node.matches(this.selectors.newChatIdentifierContainer)) {
				return null;
			}

			if (this.shouldScanNextResponse) {
				const newResponse = node.querySelector(this.selectors.response);

				if (newResponse) {
					this.shouldScanNextResponse = false;
					return newResponse;
				}
			}

			if (node.matches(this.selectors.response)) {
				return node;
			}

			const responseInAddedNode = node.querySelector(this.selectors.response);

			if (responseInAddedNode && !node.querySelector(this.selectors.prompt)) {
				return responseInAddedNode;
			}
		}

		return null;
	}
}
