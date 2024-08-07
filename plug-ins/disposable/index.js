// import createDisposableListener from "/plug-ins/disposable/index.js";


export default function createDisposableListener(element, eventType, callback, options) {
    // Add the event listener to the element
    element.addEventListener(eventType, callback, options);
    return {
        description: 'Return an object with a destroy method to remove the event listener',
        destroy() {
            element.removeEventListener(eventType, callback, options);
        }
    };
}
