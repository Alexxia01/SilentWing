/**
 * Main LLM Scanner class.
 * Orchestrates conversation detection, scanning, and background communication.
 */
class LLMScanManager {
	constructor() {
		this.setupMessageListener();
		this.conversationStore = new Map();
		this.detailStore = new Map();
		this.queueStore = new QueueStore();
		this.scanners = [
			new UrlScanner(),
			new ScriptScanner(ConversationObserver.selectors.codeBlocks, ConversationObserver.selectors.codeBlockContainer),
		];
		this.guiDrawer = new GuiDrawer();
		this.provider = new ConversationObserver({
			onNewConversation: this.handleNewConversation.bind(this),
			onPageOpened: this.handlePageOpened.bind(this),
			onResponseStarted: () => this.guiDrawer.setIconState(GuiDrawer.iconStates.scanning),
			onError: () => this.guiDrawer.setIconState(GuiDrawer.iconStates.default),
		});

		this.setupNavigationListener();

		
	}

	setupMessageListener() {
		chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
			if (msg.cmd !== "llm-scan" || !msg.data) {
				return;
			}

			const { detailId, conversationId, detections } = msg.data;

			this.handleDetections({ detailId, conversationId, detections });
		});
	}

	async handlePageOpened(inputFieldElement) {
		if (!inputFieldElement) {
			return;
		}

		const { cfg: config } = await chrome.storage.local.get("cfg");

		this.guiDrawer.drawIcon(inputFieldElement, this.provider.name, config.darkMode);

		if (!config?.isLlmScanFirstVisitDone) {
			this.guiDrawer.setIconState(GuiDrawer.iconStates.notifying);

			return;
		}

		this.guiDrawer.setIconState(GuiDrawer.iconStates.default);
	}

	setupNavigationListener() {
		const previousURL = new URL(window.location.href);

		navigation.addEventListener("navigate", (e) => {
			const newURL = new URL(e.destination.url);

			if (newURL.pathname !== previousURL.pathname || newURL.origin !== previousURL.origin) {
				this.conversationStore.clear();
				this.detailStore.clear();
				this.queueStore.clear();
			}
		});
	}

	/**
	 * Handle new conversation data
	 * - If data contains prompt/response: store in ConversationStore, scan, and process queued details
	 * - If data contains detail: store in DetailStore; queue if no conversation exists, or scan immediately
	 * @param {object} data - Conversation data from observer
	 * @param {string} data.conversationId - Conversation ID
	 * @param {Element} [data.prompt] - Prompt element
	 * @param {Element} [data.response] - Response element
	 * @param {string} [data.detailId] - Detail ID
	 * @param {Element} [data.detail] - Detail element
	 * @param {string} [data.parentDetailId] - Parent detail ID (detail that caused this detail to appear)
	 * @param {Element} [data.triggerElement] - Clicked/hovered element that caused this detail
	 */
	async handleNewConversation(data) {
		const { conversationId, prompt, response, detailId, detail, parentDetailId, triggerElement } = data;

		if (!conversationId) {
			
			return;
		}

		if (response) {
			this.conversationStore.set(conversationId, { prompt, response });

			const scanResult = await this.scanConversation(conversationId, prompt, response);

			if (!this.shouldSendToBackground(scanResult.response)) {
				return;
			}

			this.sendToBackground(scanResult);

			await this.processQueuedDetails(conversationId);

			return;
		}

		if (detail) {
			this.detailStore.set(detailId, { element: detail, conversationId, triggerElement, parentDetailId });

			if (!this.conversationStore.has(conversationId)) {
				this.queueStore.add(conversationId, detailId);
				return;
			}

			await this.scanAndSendDetail(conversationId, detailId, detail, triggerElement);

			return;
		}
	}

	async processQueuedDetails(conversationId) {
		if (!this.queueStore.has(conversationId)) {
			return;
		}

		const queuedDetailIds = this.queueStore.flush(conversationId);

		for (const detailId of queuedDetailIds) {
			const storedDetail = this.detailStore.get(detailId);

			if (!storedDetail) {
				continue;
			}

			await this.scanAndSendDetail(conversationId, detailId, storedDetail.element, storedDetail.triggerElement);
		}
	}

	async scanAndSendDetail(conversationId, detailId, detailElement, triggerElement) {
		const conversation = this.conversationStore.get(conversationId);
		const scanResult = await this.scanDetail(conversationId, detailId, detailElement, triggerElement, conversation);

		if (!this.shouldSendToBackground(scanResult.detail)) {
			return;
		}

		this.sendToBackground(scanResult);
	}

	async runScanners(element) {
		const detections = {};
		const scanMaps = {};

		const results = await Promise.all(
			this.scanners.map((scanner) => scanner.scan(element).then((scanResult) => ({ scanner, scanResult }))),
		);

		for (const { scanner, scanResult } of results) {
			const keys = Array.from(scanResult.keys());

			if (keys.length) {
				detections[scanner.type] = keys;
				scanMaps[scanner.type] = scanResult;
			}
		}

		return { detections, scanMaps };
	}

	async scanConversation(conversationId, prompt, response) {
		const { detections, scanMaps } = await this.runScanners(response);

		Object.assign(this.conversationStore.get(conversationId), scanMaps);

		return {
			conversationId,
			prompt: prompt ? prompt.innerText : null,
			response: { text: response.innerText, ...detections },
		};
	}

	/**
	 * Scan a detail element
	 */
	async scanDetail(conversationId, detailId, detailElement, triggerElement, conversation) {
		const { detections, scanMaps } = await this.runScanners(detailElement);

		Object.assign(this.detailStore.get(detailId), scanMaps);

		return {
			conversationId,
			prompt: conversation?.prompt ? conversation.prompt.innerText : null,
			response: conversation?.response ? { text: conversation.response.innerText } : null,
			detailId,
			detail: {
				text: detailElement.innerText,
				...detections,
				...this.resolveInteractionType(triggerElement),
			},
		};
	}

	/**
	 * Resolve interaction type from trigger element
	 */
	resolveInteractionType(triggerElement) {
		if (!triggerElement) {
			return {};
		}

		for (const selector of Object.keys(interactionTypeBySelector)) {
			if (triggerElement.matches(selector) || triggerElement.closest(selector)) {
				return { interactionType: interactionTypeBySelector[selector] };
			}
		}

		return {};
	}

	shouldSendToBackground(scanResult) {
		const mapped = this.scanners.map((scanner) => scanner.type);
		const somePresent = mapped.some((type) => scanResult[type]);

		if (!scanResult.text && !somePresent) {
			return false;
		}

		return true;
	}

	sendToBackground(data) {
		chrome.runtime.sendMessage(
			{
				msg: "llm-scan",
				data: { assistant: this.provider.name, ...data },
			},
			(response) => {
				if (chrome.runtime.lastError) {
					
				} else {
					
				}
			},
		);
	}

	handleDetections({ detailId, conversationId, detections }) {
		let checkResultState = [GuiDrawer.iconStates.badResult, GuiDrawer.iconStates.warningResult].includes(
			this.guiDrawer.currentState,
		)
			? this.guiDrawer.currentState
			: GuiDrawer.iconStates.goodResult;

		for (const detection of detections) {
			if (detection.category === DETECTION_CATEGORY.warning && checkResultState !== GuiDrawer.iconStates.badResult) {
				checkResultState = GuiDrawer.iconStates.warningResult;
			} else {
				checkResultState = GuiDrawer.iconStates.badResult;
			}

			if (detailId) {
				
			} else {
				
			}

			const store = detailId ? this.detailStore.get(detailId) : this.conversationStore.get(conversationId);
			const scanMap = store?.[detection.type];
			const elements = scanMap?.get(detection.data) ?? [];

			if (elements.length) {
				this.guiDrawer.markDetections(elements, detection.type, detection.category);
			}
		}

		this.guiDrawer.setIconState(checkResultState);
	}
}

const llmScanManager = new LLMScanManager();
