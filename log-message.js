export const MessageScope = Object.freeze({
    ZOOM: "Zoom",
    FORM: "Form",
    PARSING: "Parsing",
    UNKNOWN: "Unknown",
    INDEXED_DB: "IndexedDB",
    CLEAR_DATA: "Clear Data",
    MOUSE_EVENTS: "Mouse Events",
    RENDERER_WAY: "Renderer: Way",
    RENDERER_MAIN: "Renderer: Main",
    RENDERER_NODE: "Renderer: Node",
    INITIALISATION: "Initialisation",
    SERVICE_WORKER: "Service Worker",
    INPUT_VALIDATION: "Input Validation",
    CONNECTION_STATUS: "Connection Status",
    RENDERER_RELATION: "Renderer: Relation"
});

export const MessageOutput = Object.freeze({
    BOTH: "both",
    STATUS: "status",
    CONSOLE: "console"
});

function formatMessage(scope, message) {
    return `[${scope}]: ${message}.`;
}

function outputToConsole(scope, message) {
    console.log(formatMessage(scope, message));
}

function outputToStatus(scope, message) {
    const status = document.getElementById("status");
    if (status) {
        status.textContent = formatMessage(scope, message);
    }
}

export function logMessage(scope, destination = MessageOutput.BOTH, message) {
    switch (destination) {
        case MessageOutput.CONSOLE:
            outputToConsole(scope, message);
            break;
        case MessageOutput.STATUS:
            outputToStatus(scope, message);
            break;
        case MessageOutput.BOTH:
        default:
            outputToConsole(scope, message);
            outputToStatus(scope, message);
            break;
    }
}
