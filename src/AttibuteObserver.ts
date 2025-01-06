class AttributeObserver {
  private observer: MutationObserver;
  constructor(private element: HTMLElement, private callback: (mut: MutationRecord) => void) {
    this.observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === "attributes") {
          callback(mutation);
        }
      });
    })

  }

  observe(attributesToObserve?: string[]) {
    this.observer.observe(this.element, {attributes: true, attributeFilter: attributesToObserve})
  }

  disconnect() {
    this.observer.disconnect();
  }
}

export default AttributeObserver;