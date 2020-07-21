



const domQuery = require('min-dom').query;
const domAttr = require('min-dom').attr;
const domClosest = require('min-dom').closest;

const filter = require('lodash/filter');
const forEach = require('lodash/forEach');
const keys = require('lodash/keys');

const domify = require('min-dom').domify;

const updateSelection = require('selection-update');
const entryFieldDescription = require('./EntryFieldDescription');

const cmdHelper = require('../helper/CmdHelper');
const escapeHTML = require('../Utils').escapeHTML;

const TABLE_ROW_DIV_SNIPPET = '<div class="bpp-field-wrapper bpp-table-row">';
const DELETE_ROW_BUTTON_SNIPPET = '<button class="clear" data-action="deleteElement">' +
                                  '<span>X</span>' +
                                '</button>';

function createInputRowTemplate(properties, canRemove) {
  let template = TABLE_ROW_DIV_SNIPPET;
  template += createInputTemplate(properties, canRemove);
  template += canRemove ? DELETE_ROW_BUTTON_SNIPPET : '';
  template += '</div>';

  return template;
}

function createInputTemplate(properties, canRemove) {
  const columns = properties.length;
  let template = '';
  forEach(properties, function(prop) {
    template += `<input class="bpp-table-row-columns-${  columns  } ${ 
      canRemove ? 'bpp-table-row-removable' : ''  }" ` +
                       `id="smart-table-row-cell-input-value" ` +
                       `type="text" ` +
                       `name="${  escapeHTML(prop)  }" />`;
  });
  return template;
}

function createLabelRowTemplate(labels) {
  let template = TABLE_ROW_DIV_SNIPPET;
  template += createLabelTemplate(labels);
  template += '</div>';

  return template;
}

function createLabelTemplate(labels) {
  const columns = labels.length;
  let template = '';
  forEach(labels, function(label) {
    template += `<label class="bpp-table-row-columns-${  columns  }">${  escapeHTML(label)  }</label>`;
  });
  return template;
}

function pick(elements, properties) {
  return (elements || []).map(function(elem) {
    const newElement = {};
    forEach(properties, function(prop) {
      newElement[prop] = elem[prop] || '';
    });
    return newElement;
  });
}

function diff(element, node, values, oldValues, editable) {
  return filter(values, function(value, idx) {
    return !valueEqual(element, node, value, oldValues[idx], editable, idx);
  });
}

function valueEqual(element, node, value, oldValue, editable, idx) {
  if (value && !oldValue) {
    return false;
  }
  const allKeys = keys(value).concat(keys(oldValue));

  return allKeys.every(function(key) {
    const n = value[key] || undefined;
    const o = oldValue[key] || undefined;
    return !editable(element, node, key, idx) || n === o;
  });
}

function getEntryNode(node) {
  return domClosest(node, '[data-entry]', true);
}

function getContainer(node) {
  return domQuery('div[data-list-entry-container]', node);
}

function getSelection(node) {
  return {
    start: node.selectionStart,
    end: node.selectionEnd
  };
}

function setSelection(node, selection) {
  node.selectionStart = selection.start;
  node.selectionEnd = selection.end;
}

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} options.description
 * @param  {Array<string>} options.modelProperties
 * @param  {Array<string>} options.labels
 * @param  {Function} options.getElements - this callback function must return a list of business object items
 * @param  {Function} options.removeElement
 * @param  {Function} options.addElement
 * @param  {Function} options.updateElement
 * @param  {Function} options.editable
 * @param  {Function} options.setControlValue
 * @param  {Function} options.show
 *
 * @return {Object}
 */
module.exports = function(options) {

  const id = options.id;
  const modelProperties = options.modelProperties;
  const labels = options.labels;
  const description = options.description;

  const labelRow = createLabelRowTemplate(labels);

  const getElements = options.getElements;

  const removeElement = options.removeElement;
  const canRemove = typeof removeElement === 'function';

  const addElement = options.addElement;
  const canAdd = typeof addElement === 'function';
  const addLabel = options.addLabel || 'Add Value';

  const updateElement = options.updateElement;
  const canUpdate = typeof updateElement === 'function';

  const editable = options.editable || function() { return true; };
  const setControlValue = options.setControlValue;

  const show = options.show;
  const canBeShown = typeof show === 'function';

  const elements = function(element, node) {
    return pick(getElements(element, node), modelProperties);
  };

  const factory = {
    id,
    html: `${canAdd ?
      `<div class="bpp-table-add-row" ${  canBeShown ? 'data-show="show"' : ''  }>` +
            `<label>${  escapeHTML(addLabel)  }</label>` +
            `<button class="add" data-action="addElement"><span>+</span></button>` +
          `</div>` : '' 
    }<div class="bpp-table" data-show="showTable">` +
            `<div class="bpp-field-wrapper bpp-table-row">${ 
              labelRow 
            }</div>` +
            `<div data-list-entry-container>` +
            `</div>` +
          `</div>${ 

            // add description below table entry field
            description ? entryFieldDescription(description) : ''}`,

    get(element, node) {
      const boElements = elements(element, node, this.__invalidValues);

      const invalidValues = this.__invalidValues;

      delete this.__invalidValues;

      forEach(invalidValues, function(value, idx) {
        const element = boElements[idx];

        forEach(modelProperties, function(prop) {
          element[prop] = value[prop];
        });
      });

      return boElements;
    },

    set(element, values, node) {
      const action = this.__action || {};
      delete this.__action;

      if (action.id === 'delete-element') {
        return removeElement(element, node, action.idx);
      }
      if (action.id === 'add-element') {
        return addElement(element, node);
      }
      if (canUpdate) {
        const commands = [];
        let valuesToValidate = values;

        if (typeof options.validate !== 'function') {
          valuesToValidate = diff(element, node, values, elements(element, node), editable);
        }

        const self = this;

        forEach(valuesToValidate, function(value) {
          let validationError;
          const idx = values.indexOf(value);

          if (typeof options.validate === 'function') {
            validationError = options.validate(element, value, node, idx);
          }

          if (!validationError) {
            const cmd = updateElement(element, value, node, idx);

            if (cmd) {
              commands.push(cmd);
            }
          } else {
            // cache invalid value in an object by index as key
            self.__invalidValues = self.__invalidValues || {};
            self.__invalidValues[idx] = value;

            // execute a command, which does not do anything
            commands.push(cmdHelper.updateProperties(element, {}));
          }
        });

        return commands;
      }
    },
    createListEntryTemplate(value, index, selectBox) {
      return createInputRowTemplate(modelProperties, canRemove);
    },

    addElement(element, node, event, scopeNode) {
      const template = domify(createInputRowTemplate(modelProperties, canRemove));

      const container = getContainer(node);
      container.appendChild(template);

      this.__action = {
        id: 'add-element'
      };

      return true;
    },

    deleteElement(element, node, event, scopeNode) {
      const container = getContainer(node);
      const rowToDelete = event.delegateTarget.parentNode;
      const idx = parseInt(domAttr(rowToDelete, 'data-index'), 10);

      container.removeChild(rowToDelete);

      this.__action = {
        id: 'delete-element',
        idx
      };

      return true;
    },

    editable(element, rowNode, input, prop, value, idx) {
      const entryNode = domClosest(rowNode, '[data-entry]');
      return editable(element, entryNode, prop, idx);
    },

    show(element, entryNode, node, scopeNode) {
      entryNode = getEntryNode(entryNode);
      return show(element, entryNode, node, scopeNode);
    },

    showTable(element, entryNode, node, scopeNode) {
      entryNode = getEntryNode(entryNode);
      const elems = elements(element, entryNode);
      return elems && elems.length && (!canBeShown || show(element, entryNode, node, scopeNode));
    },

    validateListItem(element, value, node, idx) {
      if (typeof options.validate === 'function') {
        return options.validate(element, value, node, idx);
      }
    }

  };

  // Update/set the selection on the correct position.
  // It's the same code like for an input value in the PropertiesPanel.js.
  if (setControlValue) {
    factory.setControlValue = function(element, rowNode, input, prop, value, idx) {
      const entryNode = getEntryNode(rowNode);

      const isReadOnly = domAttr(input, 'readonly');
      const oldValue = input.value;

      let selection;

      // prevents input fields from having the value 'undefined'
      if (value === undefined) {
        value = '';
      }

      // when the attribute 'readonly' exists, ignore the comparison
      // with 'oldValue' and 'value'
      if (!!isReadOnly && oldValue === value) {
        return;
      }

      // update selection on undo/redo
      if (document.activeElement === input) {
        selection = updateSelection(getSelection(input), oldValue, value);
      }

      setControlValue(element, entryNode, input, prop, value, idx);

      if (selection) {
        setSelection(input, selection);
      }

    };
  }

  return factory;

};
