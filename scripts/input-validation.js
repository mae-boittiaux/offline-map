/**
 * @fileoverview
 * Input Validation module for validating user-entered bounding box coordinates.
 *
 * Verifies that the user-provided minimum and maximum longitude and latitude values meet 
 * the required constraints for coordinate integrity and map API compatibility. Ensures 
 * that inputs are numbers, within range, and logically correct in their ordering.
 * 
 */

import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * Evaluates all validation rules against the provided coordinates.
 *
 * Checks whether all coordinates are valid numbers, within acceptable bounds, and 
 * logically consistent (e.g. minLon < maxLon). Returns the first rule violation found.
 *
 * @private
 * @param {number} minLon - The minimum longitude value.
 * @param {number} minLat - The minimum latitude value.
 * @param {number} maxLon - The maximum longitude value.
 * @param {number} maxLat - The maximum latitude value.
 * @returns {{message: string, field?: string} | {message: null}} The validation error and target field, or null if valid.
 */
function getValidationError(minLon, minLat, maxLon, maxLat) {
    const rules = [
        {
            check: () => [minLon, minLat, maxLon, maxLat].every(isValidNumber),
            message: "All coordinate values must be valid numbers",
        },
        {
            check: () => minLon < maxLon,
            message: "Minimum Longitude must be less than maximum Longitude",
            field: "minLon"
        },
        {
            check: () => minLat < maxLat,
            message: "Minimum Latitude must be less than maximum Latitude",
            field: "minLat"
        },
        {
            check: () => ((maxLon - minLon) * (maxLat - minLat)) <= 0.25,
            message: "Bounding box area cannot exceed 0.25 square degrees",
        },
        {
            check: () => isInRange(minLon, -180, 180) && isInRange(maxLon, -180, 180),
            message: "Longitude values must be between -180 and 180",
            field: "minLon"
        },
        {
            check: () => isInRange(minLat, -90, 90) && isInRange(maxLat, -90, 90),
            message: "Latitude values must be between -90 and 90",
            field: "minLat"
        }
    ];

    for (const rule of rules) {
        if (!rule.check()) {
            return { message: rule.message, field: rule.field };
        }
    }

    return { message: null };
}

/**
 * Validates that a value is a finite number.
 *
 * @private
 * @param {*} value - The value to validate.
 * @returns {boolean} True if the value is a valid number, false otherwise.
 */
function isValidNumber(value) {
    return typeof value === "number" && isFinite(value);
}

/**
 * Determines if a number is within a specified inclusive range.
 *
 * @private
 * @param {number} value - The number to check.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {boolean} True if within range, false otherwise.
 */
function isInRange(value, min, max) {
    return value >= min && value <= max;
}

/**
 * Visually marks an input element to indicate a validation error.
 *
 * Sets a red border and message on the field to alert the user to the issue.
 *
 * @private
 * @param {HTMLInputElement} input - The input field to mark as erroneous.
 * @param {string} message - The error message to display in the tooltip.
 */
function markFieldError(input, message) {
    input.classList.add("input-error");
    input.title = message;
}

/**
 * Clears all input field validation errors.
 *
 * Removes the error class and text from all relevant fields.
 *
 * @private
 * @param {Object<string, HTMLInputElement>} fields - A map of input field names to elements.
 */
function clearFieldErrors(fields) {
    for (const key in fields) {
        const input = fields[key];
        if (input) {
            input.classList.remove("input-error");
            input.removeAttribute("title");
        }
    }
}

/**
 * Validates the user input coordinates for longitude and latitude.
 *
 * Applies all relevant validation rules, provides feedback to the user, marks any 
 * fields with errors, and logs the result to both the UI and console.
 *
 * @param {number} minLon - The minimum longitude.
 * @param {number} minLat - The minimum latitude.
 * @param {number} maxLon - The maximum longitude.
 * @param {number} maxLat - The maximum latitude.
 * @param {HTMLElement} status - The DOM element where status messages are displayed.
 * @param {Object<string, HTMLInputElement>} [fields={}] - Optional map of field elements to highlight errors.
 * @returns {boolean} True if validation passes, false otherwise.
 */
export function validateInputs(minLon, minLat, maxLon, maxLat, status, fields = {}) {
    clearFieldErrors(fields);

    const { message, field } = getValidationError(minLon, minLat, maxLon, maxLat);
    if (message) {
        status.textContent = message;
        if (field && fields[field]) {
            markFieldError(fields[field], message);
        }
        logMessage(MessageScope.INPUT_VALIDATION, MessageOutput.BOTH, message);
        return false;
    }

    status.textContent = "Status: No errors.";
    logMessage(MessageScope.INPUT_VALIDATION, MessageOutput.STATUS, "Inputs validated successfully");
    return true;
}
