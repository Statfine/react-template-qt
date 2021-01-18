const escapeHTML = require('../Utils').escapeHTML;

const domQuery = require('min-dom').query;

const entryFieldDescription = require('./EntryFieldDescription');

const textField = function(options, defaultParameters) {
  // Default action for the button next to the input-field
  const defaultButtonAction = function(element, inputNode) {
    const input = domQuery(`input[name="${options.modelProperty}"]`, inputNode);
    input.value = '';

    return true;
  };

  // default method to determine if the button should be visible
  const defaultButtonShow = function(element, inputNode) {
    const input = domQuery(`input[name="${options.modelProperty}"]`, inputNode);

    return input.value !== '';
  };

  const resource = defaultParameters;
  const label = options.label || resource.id;
  const dataValueLabel = options.dataValueLabel;
  const buttonLabel = options.buttonLabel || 'X';
  const actionName =
    typeof options.buttonAction !== 'undefined'
      ? options.buttonAction.name
      : 'clear';
  const actionMethod =
    typeof options.buttonAction !== 'undefined'
      ? options.buttonAction.method
      : defaultButtonAction;
  const showName =
    typeof options.buttonShow !== 'undefined'
      ? options.buttonShow.name
      : 'canClear';
  const showMethod =
    typeof options.buttonShow !== 'undefined'
      ? options.buttonShow.method
      : defaultButtonShow;
  const canBeDisabled =
    !!options.disabled && typeof options.disabled === 'function';
  const canBeHidden = !!options.hidden && typeof options.hidden === 'function';
  const description = options.description;

  resource.html =
    `<label for="camunda-${escapeHTML(resource.id)}" ${
      canBeDisabled ? 'data-disable="isDisabled" ' : ''
    }${canBeHidden ? 'data-show="isHidden" ' : ''}${
      dataValueLabel ? `data-value="${escapeHTML(dataValueLabel)}"` : ''
    }>${escapeHTML(label)}</label>` +
    `<div class="bpp-field-wrapper" ${
      canBeDisabled ? 'data-disable="isDisabled"' : ''
    }${canBeHidden ? 'data-show="isHidden"' : ''}>` +
    `<input id="camunda-${escapeHTML(
      resource.id,
    )}" type="text" name="${escapeHTML(options.modelProperty)}" ${
      canBeDisabled ? 'data-disable="isDisabled"' : ''
    }${canBeHidden ? 'data-show="isHidden"' : ''} />` +
    `<button class="${escapeHTML(actionName)}" data-action="${escapeHTML(
      actionName,
    )}" data-show="${escapeHTML(showName)}" ${
      canBeDisabled ? 'data-disable="isDisabled"' : ''
    }${canBeHidden ? ' data-show="isHidden"' : ''}>` +
    `<span>${escapeHTML(buttonLabel)}</span>` +
    `</button>` +
    `</div>`;

  // add description below text input entry field
  if (description) {
    resource.html += entryFieldDescription(description);
  }

  resource[actionName] = actionMethod;
  resource[showName] = showMethod;

  if (canBeDisabled) {
    resource.isDisabled = function() {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function() {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-textfield'];

  return resource;
};

module.exports = textField;
