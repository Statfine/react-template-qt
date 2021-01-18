const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const cmdHelper = require('../helper/CmdHelper');
const escapeHTML = require('../Utils').escapeHTML;

const entryFieldDescription = require('./EntryFieldDescription');

const checkbox = function (options, defaultParameters) {
  const resource = defaultParameters;
  const id = resource.id;
  const label = options.label || id;
  const canBeDisabled =
    !!options.disabled && typeof options.disabled === 'function';
  const canBeHidden = !!options.hidden && typeof options.hidden === 'function';
  const description = options.description;

  resource.html =
    `<input id="camunda-${escapeHTML(id)}" ` +
    `type="checkbox" ` +
    `name="${escapeHTML(options.modelProperty)}" ${
      canBeDisabled ? 'data-disable="isDisabled"' : ''
    }${canBeHidden ? 'data-show="isHidden"' : ''} />` +
    `<label for="camunda-${escapeHTML(id)}" ${
      canBeDisabled ? 'data-disable="isDisabled"' : ''
    }${canBeHidden ? 'data-show="isHidden"' : ''}>${escapeHTML(label)}</label>`;

  // add description below checkbox entry field
  if (description) {
    resource.html += entryFieldDescription(description);
  }

  resource.get = function (element) {
    const bo = getBusinessObject(element);
    const res = {};

    res[options.modelProperty] = bo.get(options.modelProperty);

    return res;
  };

  resource.set = function (element, values) {
    const res = {};

    res[options.modelProperty] = !!values[options.modelProperty];

    return cmdHelper.updateProperties(element, res);
  };

  if (typeof options.set === 'function') {
    resource.set = options.set;
  }

  if (typeof options.get === 'function') {
    resource.get = options.get;
  }

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

  resource.cssClasses = ['bpp-checkbox'];

  return resource;
};

module.exports = checkbox;
