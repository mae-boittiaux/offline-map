/**
 * @fileoverview 
 * OpenStreetMap Data Parsing module for XML to JavaScript object conversion.
 * 
 * The following script provides the functions to parse an XML string of OpenStreetMap 
 * data, and transform it into the JavaScript objects which represent the nodes, ways, and 
 * relations. The file also includes all of the required helper functions for processing.
 */
import { logMessage, MessageScope, MessageOutput } from './log-message.js';

/**
 * Parses XML elements with a specific tag name and applies a transformation function.
 *
 * @param {Document|Element} xmlDoc - The XML Document or element to search within.
 * @param {string} tagName - The tag name of the elements which are to be parsed.
 * @param {Function} transform - A transformation function applied to each element.
 * @returns {Array} An array of the transformed elements.
 */
const parseElements = (xmlDoc, tagName, transform) => {
    const elements = xmlDoc.getElementsByTagName(tagName);
    return [...elements].map(transform);
};

/**
 * Parses an XML string containing OpenStreetMap data into JavaScript objects.
 *
 * @param {string} xmlString - The XML string representing the OSM data.
 * @returns {{nodes: Array, ways: Array, relations: Array}} An object containing arrays of parsed nodes, ways, and relations.
 * @throws {Error} If the XML string is invalid or if the parsing fails.
 */
export const parseOSMData = (xmlString) => {
    const xml = parseXMLString(xmlString);

    return {
        nodes: parseNodes(xml),
        ways: parseWays(xml),
        relations: parseRelations(xml)
    };
};

/**
 * Parses all <node> elements within the XML document.
 *
 * @param {Document} xmlDoc - The XML Document to parse.
 * @returns {Array} An array of node objects, each containing id, lat, lon, and tags.
 */
const parseNodes = (xmlDoc) => parseElements(xmlDoc, "node", (node) => ({
    id: getAttribute(node, "id", String),
    lat: getAttribute(node, "lat", parseFloat),
    lon: getAttribute(node, "lon", parseFloat),
    tags: extractTags(node)
}));

/**
 * Parses all <way> elements within the XML document.
 *
 * @param {Document} xmlDoc - The XML Document to parse.
 * @returns {Array} An array of way objects, each containing id, an array of node references, and tags.
 */
const parseWays = (xmlDoc) => parseElements(xmlDoc, "way", (way) => ({
    id: getAttribute(way, "id", String),
    nodes: parseElements(way, "nd", (nd) => getAttribute(nd, "ref", String)),
    tags: extractTags(way)
}));

/**
 * Parses all <relation> elements within the XML document.
 *
 * @param {Document} xmlDoc - The XML Document to parse.
 * @returns {Array} An array of relation objects, each containing id, an array of members, and tags.
 */
const parseRelations = (xmlDoc) => parseElements(xmlDoc, "relation", (relation) => ({
    id: getAttribute(relation, "id", String),
    members: parseElements(relation, "member", (member) => ({
        type: getAttribute(member, "type", String),
        ref: getAttribute(member, "ref", String),
        role: getAttribute(member, "role", String)
    })),
    tags: extractTags(relation)
}));

/**
 * Extracts the tag data from an XML element.
 *
 * @param {Element} element - The XML element containing <tag> child elements.
 * @returns {Array} An array of tag objects, each with a key and value property.
 */
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

/**
 * Extracts and parses an attribute from the provided XML element.
 *
 * @param {Element} element - The XML element from which the attribute is extracted.
 * @param {string} attributeName - The name of the attribute to retrieve.
 * @param {Function} [parser=(val) => val] - A parser function to convert the attribute.
 * @returns {*} The parsed attribute value.
 * @throws {Error} If the attribute is missing or if its value is invalid.
 */
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

/**
 * Parses the provided string into an XML Document.
 *
 * @param {string} xmlString - A non-empty string containing the XML.
 * @returns {Document} The parsed XML Document.
 * @throws {Error} If the input is not a valid non-empty XML string or if parsing fails.
 */
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
