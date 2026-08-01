/**
 * Stores queued detail IDs waiting for their conversation to arrive
 */
class QueueStore {
	constructor() {
		this.store = new Map();
	}

	add(conversationId, detailId) {
		if (!this.store.has(conversationId)) {
			this.store.set(conversationId, []);
		}

		this.store.get(conversationId).push(detailId);
	}

	has(conversationId) {
		return this.store.has(conversationId);
	}

	/**
	 * Remove and return all queued detail IDs for a conversationId
	 */
	flush(conversationId) {
		const detailIds = this.store.get(conversationId) || [];

		this.store.delete(conversationId);

		return detailIds;
	}

	clear() {
		this.store.clear();
	}
}
