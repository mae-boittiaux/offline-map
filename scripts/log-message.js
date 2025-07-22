/**
 * @fileoverview 
 * Log message module for the standardised reporting of application messages.
 * 
 * Provides a consistent mechanism for handling and displaying scoped messages. Defines 
 * a set of standard message scopes using an enumeration, and allows formatted messages 
 * to be output to the browser console, the user interface status element, or both.
 * 
 */

/**
 * Enum for categorising the message scope.
 * 
 * The exhaustive list of labels which are used to prefix the messages for the clear 
 * identification of the functional area that generated the message.
 * 
 * @readonly
 * @enum {string}
 */
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

/**
 * Enum for selecting the output destination of the messages.
 * 
 * This is used to specify whether a message should be logged to the browser console, 
 * displayed in the status element on the canvas element, or both.
 * 
 * @readonly
 * @enum {string}
 */
export const MessageOutput = Object.freeze({
    BOTH: "both",
    STATUS: "status",
    CONSOLE: "console"
});

/**
 * Formats a standardised message.
 * 
 * Wraps the provided message with its associated scope label in square brackets.
 * 
 * @private
 * @param {string} scope - The functional scope of the message.
 * @param {string} message - The actual message content.
 * @returns {string} A formatted message string.
 */
function formatMessage(scope, message) {
    return `[${scope}]: ${message}.`;
}

/**
 * Logs a formatted message to the browser console.
 * 
 * @private
 * @param {string} scope - The scope of the message.
 * @param {string} message - The message to log.
 */
function outputToConsole(scope, message) {
    console.log(formatMessage(scope, message));
}

/**
 * Displays a formatted message in the UI status element.
 * 
 * If the status element with ID 'status' is not found in the DOM, no action is taken.
 * 
 * @private
 * @param {string} scope - The scope of the message.
 * @param {string} message - The message to display.
 */
function outputToStatus(scope, message) {
    const status = document.getElementById("status");
    if (status) {
        status.textContent = formatMessage(scope, message);
    }
}

/**
 * Outputs a message to the specified destination.
 * 
 * Routes the message based on the selected output mode:
 * - 'console' logs to console only.
 * - 'status' updates the status UI only.
 * - 'both' performs both actions.
 * 
 * @param {string} scope - A value from MessageScope indicating the origin of the message.
 * @param {string} destination - A value from MessageOutput indicating where to send the message.
 * @param {string} message - The actual message to be reported.
 * @returns {void}
 */
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
