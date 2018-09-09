export function getParentByClass(child, parentClass) {
    let parent = child;
    do {
        if (parent.classList.contains(parentClass)) {
            return parent;
        }
    } while (parent = parent.parentElement)
    return null;
}

export function getParentById(child, idElem) {
    let parent = child;
    while (parent = parent.parentElement) {
        if (parent.id === idElem) {
            return parent;
        }
    }
    return null;
}