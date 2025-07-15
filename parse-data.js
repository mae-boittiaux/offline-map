import { logMessage, MessageScope, MessageOutput } from './log-message.js';

const parseElements = (xmlDoc, tagName, transform) => {
    const elements = xmlDoc.getElementsByTagName(tagName);
    return [...elements].map(transform);
};

export const parseOSMData = (xmlString) => {
    const xml = parseXMLString(xmlString);

    return {
        nodes: parseNodes(xml),
        ways: parseWays(xml),
        relations: parseRelations(xml)
    };
};

const parseNodes = (xmlDoc) => parseElements(xmlDoc, "node", (node) => ({
    id: getAttribute(node, "id", String),
    lat: getAttribute(node, "lat", parseFloat),
    lon: getAttribute(node, "lon", parseFloat),
    tags: extractTags(node)
}));

const parseWays = (xmlDoc) => parseElements(xmlDoc, "way", (way) => ({
    id: getAttribute(way, "id", String),
    nodes: parseElements(way, "nd", (nd) => getAttribute(nd, "ref", String)),
    tags: extractTags(way)
}));

const parseRelations = (xmlDoc) => parseElements(xmlDoc, "relation", (relation) => ({
    id: getAttribute(relation, "id", String),
    members: parseElements(relation, "member", (member) => ({
        type: getAttribute(member, "type", String),
        ref: getAttribute(member, "ref", String),
        role: getAttribute(member, "role", String)
    })),
    tags: extractTags(relation)
}));

const extractTags = (element) => {
    const tagElements = element.getElementsByTagName("tag");
    if (!tagElements || tagElements.length === 0) {
        return [];
    }

    return [...tagElements].map((tag) => ({
        key: getAttribute(tag, "k", String),
        value: getAttribute(tag, "v", String)
    }));
};

function getAttribute(element, attributeName, parser = (val) => val) {
    const attribute = element.getAttribute(attributeName);
    if (attribute === null) {
        logMessage(MessageScope.PARSING, MessageOutput.CONSOLE, `Missing attribute: ${attributeName}`);
        throw new Error(`Missing attribute: ${attributeName}`);
    }

    const parsed = parser(attribute);
    if (parsed === undefined || (typeof parsed === 'number' && isNaN(parsed))) {
        logMessage(MessageScope.PARSING, MessageOutput.CONSOLE, `Invalid value for attribute: ${attributeName}`);
        throw new Error(`Invalid value for attribute: ${attributeName}`);
    }

    return parsed;
}

function parseXMLString(xmlString) {
    if (typeof xmlString !== "string" || xmlString.trim() === "") {
        logMessage(MessageScope.PARSING, MessageOutput.CONSOLE, "A non-empty XML string must be provided");
        throw new Error("A non-empty XML string must be provided");
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
        logMessage(MessageScope.PARSING, MessageOutput.CONSOLE, `Error parsing XML: ${parserError.textContent}`);
        throw new Error(`Error parsing XML: ${parserError.textContent}`);
    }

    return xmlDoc;
}
