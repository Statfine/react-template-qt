const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;

const domQuery = require('min-dom').query;
const domClosest = require('min-dom').closest;
const domify = require('min-dom').domify;
const forEach = require('lodash/forEach');

const elementHelper = require('../../../../helper/ElementHelper');
const cmdHelper = require('../../../../helper/CmdHelper');
const utils = require('../../../../Utils');
const escapeHTML = utils.escapeHTML;

function getSelectBox(node, id) {
  const currentTab = domClosest(node, 'div.bpp-properties-tab');
  const query = `select[name=selectedExtensionElement]${
    id ? `[id=cam-extensionElements-${id}]` : ''
  }`;
  return domQuery(query, currentTab);
}

function getSelected(node, id) {
  const selectBox = getSelectBox(node, id);
  return {
    value: (selectBox || {}).value,
    idx: (selectBox || {}).selectedIndex,
  };
}

function generateElementId(prefix) {
  prefix += '_';
  return utils.nextId(prefix);
}

const CREATE_EXTENSION_ELEMENT_ACTION = 'create-extension-element';
const REMOVE_EXTENSION_ELEMENT_ACTION = 'remove-extension-element';

module.exports = function(element, bpmnFactory, options, translate) {
  const id = options.id;
  const prefix = options.prefix || 'elem';
  const label = options.label || id;
  const idGeneration =
    options.idGeneration === false ? options.idGeneration : true;
  let businessObject = options.businessObject || getBusinessObject(element);

  const modelProperty = options.modelProperty || 'id';

  const getElements = options.getExtensionElements;

  const createElement = options.createExtensionElement;
  const canCreate = typeof createElement === 'function';

  const removeElement = options.removeExtensionElement;
  const canRemove = typeof removeElement === 'function';

  const onSelectionChange = options.onSelectionChange;

  const hideElements = options.hideExtensionElements;
  const canBeHidden = typeof hideElements === 'function';

  const setOptionLabelValue = options.setOptionLabelValue;

  const defaultSize = options.size || 5;
  const resizable = options.resizable;

  const reference = options.reference || undefined;

  const selectionChanged = function(element, node, event, scope) {
    if (typeof onSelectionChange === 'function') {
      return onSelectionChange(element, node, event, scope);
    }
  };

  const createOption = function(value) {
    return `<option value="${escapeHTML(
      value,
    )}" data-value data-name="extensionElementValue">${escapeHTML(
      value,
    )}</option>`;
  };

  const initSelectionSize = function(selectBox, optionsLength) {
    if (resizable) {
      selectBox.size =
        optionsLength > defaultSize ? optionsLength : defaultSize;
    }
  };

  return {
    id,
    html:
      `<div class="bpp-row bpp-element-list" ${
        canBeHidden ? 'data-show="hideElements"' : ''
      }>` +
      `<label for="cam-extensionElements-${escapeHTML(id)}">${escapeHTML(
        label,
      )}</label>` +
      `<div class="bpp-field-wrapper">` +
      `<select id="cam-extensionElements-${escapeHTML(id)}"` +
      `name="selectedExtensionElement" ` +
      `size="${escapeHTML(defaultSize)}" ` +
      `data-list-entry-container ` +
      `data-on-change="selectElement">` +
      `</select>${
        canCreate
          ? `${'<button class="add" ' +
              'id="cam-extensionElements-create-'}${escapeHTML(id)}" ` +
            `data-action="createElement">` +
            `<span>+</span>` +
            `</button>`
          : ''
      }${
        canRemove
          ? `${'<button class="clear" ' +
              'id="cam-extensionElements-remove-'}${escapeHTML(id)}" ` +
            `data-action="removeElement" ` +
            `data-disable="disableRemove">` +
            `<span>-</span>` +
            `</button>`
          : ''
      }</div>` +
      `</div>`,

    get(element, node) {
      const elements = getElements(element, node);

      const result = [];
      forEach(elements, function(elem) {
        result.push({
          extensionElementValue: elem.get(modelProperty),
        });
      });

      const selectBox = getSelectBox(node.parentNode, id);
      initSelectionSize(selectBox, result.length);

      return result;
    },

    set(element, values, node) {
      const action = this.__action;
      delete this.__action;

      businessObject = businessObject || getBusinessObject(element);

      const bo =
        reference && businessObject.get(reference)
          ? businessObject.get(reference)
          : businessObject;

      let extensionElements = bo.get('extensionElements');

      if (action.id === CREATE_EXTENSION_ELEMENT_ACTION) {
        const commands = [];
        if (!extensionElements) {
          extensionElements = elementHelper.createElement(
            'bpmn:ExtensionElements',
            { values: [] },
            bo,
            bpmnFactory,
          );
          commands.push(
            cmdHelper.updateBusinessObject(element, bo, { extensionElements }),
          );
        }
        commands.push(
          createElement(element, extensionElements, action.value, node),
        );
        return commands;
      }
      if (action.id === REMOVE_EXTENSION_ELEMENT_ACTION) {
        return removeElement(
          element,
          extensionElements,
          action.value,
          action.idx,
          node,
        );
      }
    },

    createListEntryTemplate(value, index, selectBox) {
      initSelectionSize(selectBox, selectBox.options.length + 1);
      return createOption(value.extensionElementValue);
    },

    deselect(element, node) {
      const selectBox = getSelectBox(node, id);
      selectBox.selectedIndex = -1;
    },

    getSelected(element, node) {
      return getSelected(node, id);
    },

    setControlValue(element, node, option, property, value, idx) {
      node.value = value;

      if (!setOptionLabelValue) {
        node.text = value;
      } else {
        setOptionLabelValue(element, node, option, property, value, idx);
      }
    },

    createElement(element, node) {
      // create option template
      let generatedId;
      if (idGeneration) {
        generatedId = generateElementId(prefix);
      }

      const selectBox = getSelectBox(node, id);
      const template = domify(createOption(generatedId));

      // add new empty option as last child element
      selectBox.appendChild(template);

      // select last child element
      selectBox.lastChild.selected = 'selected';
      selectionChanged(element, node);

      // update select box size
      initSelectionSize(selectBox, selectBox.options.length);

      this.__action = {
        id: CREATE_EXTENSION_ELEMENT_ACTION,
        value: generatedId,
      };

      return true;
    },

    removeElement(element, node) {
      const selection = getSelected(node, id);

      const selectBox = getSelectBox(node, id);
      selectBox.removeChild(selectBox.options[selection.idx]);

      // update select box size
      initSelectionSize(selectBox, selectBox.options.length);

      this.__action = {
        id: REMOVE_EXTENSION_ELEMENT_ACTION,
        value: selection.value,
        idx: selection.idx,
      };

      return true;
    },

    hideElements(element, entryNode, node, scopeNode) {
      return !hideElements(element, entryNode, node, scopeNode);
    },

    disableRemove(element, entryNode, node, scopeNode) {
      return (getSelected(entryNode, id) || {}).idx < 0;
    },

    selectElement: selectionChanged,
  };
};
