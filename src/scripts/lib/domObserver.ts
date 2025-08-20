export function onMounted(element: ChildNode | Array<ChildNode>, callback: () => void): void {
    if (Array.isArray(element)) {
        element.forEach(e => onMounted(e, callback));
        return;
    }
    let inDom = element.isConnected;
    const observer = new MutationObserver(function () {
        if (element.isConnected) {
            if (!inDom) {
                callback();
            }
            inDom = true;
        } else if (inDom) {
            inDom = false;
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});
}

export function onRemoved(element: ChildNode | Array<ChildNode>, callback: () => void): void {
    if (Array.isArray(element)) {
        element.forEach(e => onRemoved(e, callback));
        return;
    }
    let inDom = element.isConnected;
    const observer = new MutationObserver(function () {
        if (element.isConnected) {
            inDom = true;
        } else if (inDom) {
            inDom = false;
            callback();
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});
}