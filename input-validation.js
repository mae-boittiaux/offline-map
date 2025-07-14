import { logMessage, MessageScope, MessageOutput } from './log-message.js';

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

function isValidNumber(value) {
    return typeof value === "number" && isFinite(value);
}

function isInRange(value, min, max) {
    return value >= min && value <= max;
}

function markFieldError(input, message) {
    input.classList.add("input-error");
    input.title = message;
}

function clearFieldErrors(fields) {
    for (const key in fields) {
        const input = fields[key];
        if (input) {
            input.classList.remove("input-error");
            input.removeAttribute("title");
        }
    }
}

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
