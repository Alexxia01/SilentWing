/**
 * Base ConversationObserver class for LLM platforms.
 */
class BaseConversationObserver {
	name = "base";
	selectors = {};
	pendingDetails = {};
	inputFieldDetected = false;
	detectedInputFieldElement = null;

	constructor({ onNewConversation, onPageOpened, onResponseStarted, onError } = {}) {
		if (!onNewConversation || typeof onNewConversation !== "function") {
			throw new Error("onNewConversation callback is required");
		}

		this.onNewConversation = onNewConversation;
		this.onError = onError;
		this.onPageOpened = onPageOpened;
		this.onResponseStarted = onResponseStarted;
		this.interactionTracker = new InteractionTracker();
		this.initializeMutationObserver();
	}

	initializeMutationObserver() {
		this.mutationObserver = new MutationObserver((mutations) => {
			this.handleMutations(mutations);
		});

		this.mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true,
		});

		this.detectInputField();
	}

	detectInputField() {
		if (this.inputFieldDetected || !this.selectors.promptInputContainer) {
			return;
		}

		const inputField = document.body.querySelector?.(this.selectors.promptInputContainer) || null;

		if (!inputField) {
			
			return;
		}

		this.inputFieldDetected = true;
		this.detectedInputFieldElement = inputField;
		this.onPageOpened?.(inputField);
	}

	handleMutations(mutations) {
		for (const mutation of mutations) {
			if (mutation.addedNodes.length || mutation.removedNodes.length || mutation.target.nodeType === Node.TEXT_NODE) {
				const addedNodes = Array.from(mutation.addedNodes);
				const removedNodes = Array.from(mutation.removedNodes);

				if (this.inputFieldDetected && removedNodes.length > 0 && !document.contains(this.detectedInputFieldElement)) {
					this.inputFieldDetected = false;
					this.detectedInputFieldElement = null;
				}

				if (!this.inputFieldDetected) {
					for (const node of addedNodes) {
						if (node.nodeType === Node.ELEMENT_NODE) {
							this.detectInputField();

							if (this.inputFieldDetected) {
								break;
							}
						}
					}
				}

				const newResponse = this.detectNewConversation(addedNodes, removedNodes);

				if (newResponse) {
					const responseId = generateId();

					newResponse.dataset.llmScanId = responseId;

					if (this.onResponseStarted) {
						this.onResponseStarted(document.body);
					}

					this.interactionTracker.attach(responseId, newResponse);
					this.processNewConversation(responseId, newResponse);
				}

				if (mutation.type === "characterData" && mutation.target.parentElement) {
					addedNodes.push(mutation.target.parentElement);
				}

				const additionalContent = this.detectAdditionalContent(addedNodes, removedNodes);

				if (additionalContent) {
					this.processAdditionalContent(
						this.interactionTracker.getActiveResponseId(),
						additionalContent,
						this.interactionTracker.getActiveElement(),
					);
				}
			}
		}
	}

	async processAdditionalContent(responseId, additionalContentNode, triggerElement) {
		const parentDetailElement = triggerElement?.closest?.("[data-llm-scan-detail-id]") ?? null;
		const parentDetailId = parentDetailElement?.dataset.llmScanDetailId ?? null;

		const selectorsStr = this.selectors.additionalContentList?.join(", ");

		if (!selectorsStr) {
			return;
		}

		const targetElement =
			additionalContentNode.querySelector(selectorsStr) ||
			(additionalContentNode.matches(selectorsStr) ? additionalContentNode : null);

		if (!targetElement) {
			return;
		}

		const responseIdAttr = targetElement.dataset.llmScanResponseId;
		const effectiveResponseId = responseId || responseIdAttr;

		if (!effectiveResponseId) {
			return;
		}

		let detailId = targetElement.dataset.llmScanDetailId;

		if (!detailId) {
			detailId = generateId();

			targetElement.dataset.llmScanDetailId = detailId;
			targetElement.dataset.llmScanResponseId = responseId;

			this.interactionTracker.attach(responseId, targetElement);
		}

		const currentContentHash = await generateElementHash(targetElement);
		const previousHash = targetElement.dataset.llmScanContentHash;

		if (previousHash && previousHash === currentContentHash) {
			return;
		}

		clearTimeout(this.pendingDetails[detailId]?.timeoutId);

		if (!this.pendingDetails[detailId]) {
			this.pendingDetails[detailId] = { element: targetElement, timeoutId: null };
		}

		const scheduleProcessing = (respId, dId) => {
			this.pendingDetails[dId].timeoutId = setTimeout(() => {
				targetElement.dataset.llmScanContentHash = currentContentHash;

				delete this.pendingDetails[dId];

				this.onNewConversation({
					conversationId: respId,
					detailId: dId,
					detail: additionalContentNode,
					parentDetailId,
					triggerElement,
				});
			}, OBSERVER_TIMING.detailProcessingDelay);
		};

		scheduleProcessing(effectiveResponseId, detailId);
	}

	async processNewConversation(responseId, responseNode) {
		try {
			await this.waitForResponseCompletion(responseNode);

			const conversation = this.createConversationPair(responseNode);

			if (!conversation || !conversation.prompt || !conversation.response) {
				return;
			}

			this.onNewConversation({ conversationId: responseId, ...conversation });
		} catch (error) {
			this.onError?.();
			
		}
	}

	waitForResponseCompletion(responseNode) {
		return new Promise((resolve, reject) => {
			let completionTimeoutId = null;
			let maxTimeoutId = null;

			const observer = new MutationObserver(() => {
				clearTimeout(maxTimeoutId);

				if (this.isResponseComplete(responseNode)) {
					clearTimeout(completionTimeoutId);

					completionTimeoutId = setTimeout(() => {
						observer.disconnect();
						resolve();
					}, OBSERVER_TIMING.responseCompletionDelay);

					return;
				}

				maxTimeoutId = setTimeout(() => {
					observer.disconnect();
					clearTimeout(completionTimeoutId);
					reject(`Response completion timed out for conversation ID ${responseNode.dataset.llmScanId}`);
				}, OBSERVER_TIMING.maxResponseWait);
			});

			observer.observe(responseNode, {
				childList: true,
				subtree: true,
				characterData: true,
			});

			if (this.isResponseComplete(responseNode)) {
				completionTimeoutId = setTimeout(() => {
					observer.disconnect();
					resolve();
				}, OBSERVER_TIMING.responseCompletionDelay);
			}
		});
	}

	isResponseComplete(responseNode) {
		if (!this.selectors.responseLoadedIndicator) {
			return true;
		}

		const hasIndicator = responseNode.querySelector(this.selectors.responseLoadedIndicator) !== null;

		return hasIndicator;
	}

	findPromptForResponse(responseNode) {
		let searchNode = responseNode;

		while (searchNode) {
			let currentNode = searchNode.previousSibling;

			while (currentNode) {
				if (currentNode.nodeType === Node.ELEMENT_NODE) {
					if (currentNode.matches(this.selectors.prompt)) {
						return currentNode;
					}

					const inner = currentNode.querySelector(this.selectors.prompt);

					if (inner) {
						return inner;
					}
				}

				currentNode = currentNode.previousSibling;
			}

			searchNode = searchNode.parentElement;
		}

		
		return null;
	}

	createConversationPair(responseNode) {
		const prompt = this.findPromptForResponse(responseNode);

		return {
			prompt,
			response: responseNode,
			provider: this.name,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Clean up all observers, timers, and tracked state
	 */
	dispose() {
		this.mutationObserver.disconnect();

		for (const detail of Object.values(this.pendingDetails)) {
			clearTimeout(detail.timeoutId);
		}

		this.pendingDetails = {};
		this.interactionTracker.reset();

		
	}

	/**
	 * Detect new conversation from mutations (Template Method - required override)
	 */
	detectNewConversation(addedNodes, removedNodes) {
		throw new Error("detectNewConversation() must be implemented by subclass");
	}

	/**
	 * Detect additional content from mutations (Template Method - optional override)
	 */
	detectAdditionalContent(addedNodes, removedNodes) {
		return null;
	}
}
