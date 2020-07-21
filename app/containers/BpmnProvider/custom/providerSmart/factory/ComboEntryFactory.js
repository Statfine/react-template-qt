

const assign = require('lodash/assign');
const find = require('lodash/find');

const domQuery = require('min-dom').query;

const escapeHTML = require('../Utils').escapeHTML;

const selectEntryFactory = require('./SelectEntryFactory');
const entryFieldDescription = require('./EntryFieldDescription');


/**
 * The combo box is a special implementation of the select entry and adds the option 'custom' to the
 * select box. If 'custom' is selected, an additional text input field is shown which allows to define
 * a custom value.
 *
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} options.label
 * @param  {Array<Object>} options.selectOptions list of name/value pairs
 * @param  {string} options.modelProperty
 * @param  {function} options.get
 * @param  {function} options.set
 * @param  {string} [options.customValue] custom select option value (default: 'custom')
 * @param  {string} [options.customName] custom select option name visible in the select box (default: 'custom')
 *
 * @return {Object}
 */
const comboBox = function(options) {

  const selectOptions = options.selectOptions;
  const modelProperty = options.modelProperty;
  const customValue = options.customValue || 'custom';
  const customName = options.customName || `custom ${  modelProperty}`;
  const description = options.description;

  // check if a value is not a built in value
  const isCustomValue = function(value) {
    if (typeof value[modelProperty] === 'undefined') {
      return false;
    }

    const isCustom = !find(selectOptions, function(option) {
      return value[modelProperty] === option.value;
    });

    return isCustom;
  };

  const comboOptions = assign({}, options);

  // true if the selected value in the select box is customValue
  comboOptions.showCustomInput = function(element, node) {
    const selectBox = domQuery(`[data-entry="${ options.id }"] select`, node.parentNode);

    if (selectBox) {
      return selectBox.value === customValue;
    }

    return false;
  };

  comboOptions.get = function(element, node) {
    const value = options.get(element, node);

    const modifiedValues = {};

    if (!isCustomValue(value)) {
      modifiedValues[modelProperty] = value[modelProperty] || '';

      return modifiedValues;
    }

    modifiedValues[modelProperty] = customValue;
    modifiedValues[`custom-${modelProperty}`] = value[modelProperty];

    return modifiedValues;
  };

  comboOptions.set = function(element, values, node) {
    const modifiedValues = {};

    // if the custom select option has been selected
    // take the value from the text input field
    if (values[modelProperty] === customValue) {
      modifiedValues[modelProperty] = values[`custom-${  modelProperty}`] || '';
    }
    else if (options.emptyParameter && values[modelProperty] === '') {
      modifiedValues[modelProperty] = undefined;
    } else {
      modifiedValues[modelProperty] = values[modelProperty];
    }
    return options.set(element, modifiedValues, node);
  };

  comboOptions.selectOptions.push({ name: customName, value: customValue });

  const comboBoxEntry = assign({}, selectEntryFactory(comboOptions, comboOptions));

  comboBoxEntry.html += `${'<div class="bpp-field-wrapper bpp-combo-input" ' +
    'data-show="showCustomInput"' +
    '>' +
    '<input id="camunda-'}${  escapeHTML(options.id)  }-input" type="text" name="custom-${ 
    escapeHTML(modelProperty)  }" ` +
    ` />` +
  `</div>`;

  // add description below combo box entry field
  if (description) {
    comboBoxEntry.html += entryFieldDescription(description);
  }

  return comboBoxEntry;
};

module.exports = comboBox;
