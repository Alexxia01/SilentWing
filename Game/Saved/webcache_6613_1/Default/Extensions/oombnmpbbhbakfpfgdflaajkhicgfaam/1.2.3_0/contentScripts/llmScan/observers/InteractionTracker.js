/**
 * Tracks which response element the user is currently interacting with
 * via mouse hover and click events.
 */
class InteractionTracker {
	constructor() {
		this.click = { responseId: null, element: null, timeoutId: null };
		this.hover = { responseId: null, element: null };
	}

	/**
	 * Attach mouse listeners to a response element to track user interaction
	 */
	attach(responseId, element) {
		element.addEventListener("mouseenter", (event) => {
			this.hover.responseId = responseId;
		});

		element.addEventListener("mouseover", (event) => {
			this.hover.element = event.target;
		});

		element.addEventListener("mouseleave", () => {
			this.hover.responseId = null;
		});

		element.addEventListener("click", (event) => {
			clearTimeout(this.click.timeoutId);
			this.click.responseId = responseId;
			this.click.element = event.target;
			this.click.timeoutId = setTimeout(() => {
				this.click.responseId = null;
				this.click.element = null;
			}, OBSERVER_TIMING.clickResetDelay);
		});
	}

	/**
	 * Get the response ID of the element the user most recently interacted with.
	 * Click takes priority over hover.
	 */
	getActiveResponseId() {
		return this.click.responseId || this.hover.responseId;
	}

	/**
	 * Get the element the user most recently interacted with.
	 * Click takes priority over hover.
	 */
	getActiveElement() {
		return this.click.element || this.hover.element;
	}

	/**
	 * Clear all tracked state
	 */
	reset() {
		clearTimeout(this.click.timeoutId);
		this.click = { responseId: null, element: null, timeoutId: null };
		this.hover = { responseId: null, element: null };
	}
}
