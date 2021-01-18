const domQuery = require('min-dom').query;
const domClear = require('min-dom').clear;
const is = require('bpmn-js/lib/util/ModelUtil').is;
const forEach = require('lodash/forEach');
const domify = require('min-dom').domify;
const Ids = require('ids').default;

const SPACE_REGEX = /\s/;

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
const QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i;

// for ID validation as per BPMN Schema (QName - Namespace)
const ID_REGEX = /^[a-z_][\w-.]*$/i;

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function selectedOption(selectBox) {
  if (selectBox.selectedIndex >= 0) {
    return selectBox.options[selectBox.selectedIndex].value;
  }
}

module.exports.selectedOption = selectedOption;

function selectedType(elementSyntax, inputNode) {
  const typeSelect = domQuery(elementSyntax, inputNode);
  return selectedOption(typeSelect);
}

module.exports.selectedType = selectedType;

/**
 * Retrieve the root element the document this
 * business object is contained in.
 *
 * @return {ModdleElement}
 */
function getRoot(businessObject) {
  let parent = businessObject;
  while (parent.$parent) {
    parent = parent.$parent;
  }
  return parent;
}

module.exports.getRoot = getRoot;

/**
 * filters all elements in the list which have a given type.
 * removes a new list
 */
function filterElementsByType(objectList, type) {
  const list = objectList || [];
  const result = [];
  forEach(list, function(obj) {
    if (is(obj, type)) {
      result.push(obj);
    }
  });
  return result;
}

module.exports.filterElementsByType = filterElementsByType;

function findRootElementsByType(businessObject, referencedType) {
  const root = getRoot(businessObject);

  return filterElementsByType(root.rootElements, referencedType);
}

module.exports.findRootElementsByType = findRootElementsByType;

function removeAllChildren(domElement) {
  while (domElement.firstChild) {
    domElement.removeChild(domElement.firstChild);
  }
}

module.exports.removeAllChildren = removeAllChildren;

/**
 * adds an empty option to the list
 */
function addEmptyParameter(list) {
  return list.push({ label: '', value: '', name: '' });
}

module.exports.addEmptyParameter = addEmptyParameter;

/**
 * returns a list with all root elements for the given parameter 'referencedType'
 */
function refreshOptionsModel(businessObject, referencedType) {
  const model = [];
  const referableObjects = findRootElementsByType(
    businessObject,
    referencedType,
  );
  forEach(referableObjects, function(obj) {
    model.push({
      label: `${obj.name || ''} (id=${obj.id})`,
      value: obj.id,
      name: obj.name,
    });
  });
  return model;
}

module.exports.refreshOptionsModel = refreshOptionsModel;

/**
 * fills the drop down with options
 */
function updateOptionsDropDown(
  domSelector,
  businessObject,
  referencedType,
  entryNode,
) {
  const options = refreshOptionsModel(businessObject, referencedType);
  addEmptyParameter(options);
  const selectBox = domQuery(domSelector, entryNode);
  domClear(selectBox);

  forEach(options, function(option) {
    const optionEntry = domify(
      `<option value="${escapeHTML(option.value)}">${escapeHTML(
        option.label,
      )}</option>`,
    );
    selectBox.appendChild(optionEntry);
  });
  return options;
}

module.exports.updateOptionsDropDown = updateOptionsDropDown;

/**
 * checks whether the id value is valid
 *
 * @param {ModdleElement} bo
 * @param {String} idValue
 * @param {Function} translate
 *
 * @return {String} error message
 */
function isIdValid(bo, idValue, translate) {
  const assigned = bo.$model.ids.assigned(idValue);

  const idExists = assigned && assigned !== bo;

  if (!idValue || idExists) {
    return translate('Element must have an unique id.');
  }

  return validateId(idValue, translate);
}

module.exports.isIdValid = isIdValid;

function validateId(idValue, translate) {
  if (containsSpace(idValue)) {
    return translate('Id must not contain spaces.');
  }

  if (!ID_REGEX.test(idValue)) {
    if (QNAME_REGEX.test(idValue)) {
      return translate('Id must not contain prefix.');
    }

    return translate('Id must be a valid QName.');
  }
}

module.exports.validateId = validateId;

function containsSpace(value) {
  return SPACE_REGEX.test(value);
}

module.exports.containsSpace = containsSpace;

/**
 * generate a semantic id with given prefix
 */
function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);

  return ids.nextPrefixed(prefix);
}

module.exports.nextId = nextId;

function triggerClickEvent(element) {
  let evt;
  const eventType = 'click';

  if (document.createEvent) {
    try {
      // Chrome, Safari, Firefox
      evt = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true,
      });
    } catch (e) {
      // IE 11, PhantomJS (wat!)
      evt = document.createEvent('MouseEvent');

      evt.initEvent(eventType, true, true);
    }
    return element.dispatchEvent(evt);
  }
  // Welcome IE
  evt = document.createEventObject();

  return element.fireEvent(`on${eventType}`, evt);
}

module.exports.triggerClickEvent = triggerClickEvent;

function escapeHTML(str) {
  str = `${str}`;

  return (
    str &&
    str.replace(/[&<>"']/g, function(match) {
      return HTML_ESCAPE_MAP[match];
    })
  );
}

module.exports.escapeHTML = escapeHTML;
