const domify = require('min-dom').domify;

const forEach = require('lodash/forEach');
const escapeHTML = require('../Utils').escapeHTML;

const entryFieldDescription = require('./EntryFieldDescription');

const isList = function (list) {
  return !(!list || Object.prototype.toString.call(list) !== '[object Array]');
};

const addEmptyParameter = function (list) {
  return list.concat([{ name: '', value: '' }]);
};

const createOption = function (option) {
  return `<option value="${option.value}">${option.name}</option>`;
};

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} [options.label]
 * @param  {Array<Object>} options.selectOptions
 * @param  {string} options.modelProperty
 * @param  {boolean} options.emptyParameter
 * @param  {function} options.disabled
 * @param  {function} options.hidden
 * @param  {Object} defaultParameters
 *
 * @return {Object}
 */
const selectbox = function (options, defaultParameters) {
  const resource = defaultParameters;
  const label = options.label || resource.id;
  let selectOptions = options.selectOptions || [{ name: '', value: '' }];
  const modelProperty = options.modelProperty;
  const emptyParameter = options.emptyParameter;
  const canBeDisabled =
    !!options.disabled && typeof options.disabled === 'function';
  const canBeHidden = !!options.hidden && typeof options.hidden === 'function';
  const description = options.description;

  if (emptyParameter) {
    selectOptions = addEmptyParameter(selectOptions);
  }

  resource.html =
    `<label for="smart-${escapeHTML(resource.id)}"${
      canBeDisabled ? 'data-disable="isDisabled" ' : ''
    }${canBeHidden ? 'data-show="isHidden" ' : ''}>${escapeHTML(
      label,
    )}</label>` +
    `<select id="smart-${escapeHTML(resource.id)}-select" name="${escapeHTML(
      modelProperty,
    )}"${canBeDisabled ? 'data-disable="isDisabled" ' : ''}${
      canBeHidden ? 'data-show="isHidden" ' : ''
    } data-value>`;

  if (isList(selectOptions)) {
    forEach(selectOptions, function (option) {
      resource.html += `<option value="${escapeHTML(option.value)}">${
        option.name ? escapeHTML(option.name) : ''
      }</option>`;
    });
  }

  resource.html += '</select>';

  // add description below select box entry field
  if (description && typeof options.showCustomInput !== 'function') {
    resource.html += entryFieldDescription(description);
  }

  /**
   * Fill the select box options dynamically.
   *
   * Calls the defined function #selectOptions in the entry to get the
   * values for the options and set the value to the inputNode.
   *
   * @param {djs.model.Base} element
   * @param {HTMLElement} entryNode
   * @param {EntryDescriptor} inputNode
   * @param {Object} inputName
   * @param {Object} newValue
   */
  resource.setControlValue = function (
    element,
    entryNode,
    inputNode,
    inputName,
    newValue,
  ) {
    if (typeof selectOptions === 'function') {
      const options = selectOptions(element, inputNode);

      if (options) {
        // remove existing options
        while (inputNode.firstChild) {
          inputNode.removeChild(inputNode.firstChild);
        }

        // add options
        forEach(options, function (option) {
          const template = domify(createOption(option));

          inputNode.appendChild(template);
        });
      }
    }

    // set select value
    if (newValue !== undefined) {
      inputNode.value = newValue;
    }
  };

  if (canBeDisabled) {
    resource.isDisabled = function () {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function () {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-dropdown'];

  return resource;
};

module.exports = selectbox;
