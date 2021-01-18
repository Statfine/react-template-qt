const escapeHTML = require('../Utils').escapeHTML;

const entryFieldDescription = require('./EntryFieldDescription');

const textBox = function(options, defaultParameters) {
  const resource = defaultParameters;
  const label = options.label || resource.id;
  const canBeShown = !!options.show && typeof options.show === 'function';
  const description = options.description;

  resource.html =
    `<label for="camunda-${escapeHTML(resource.id)}" ${
      canBeShown ? 'data-show="isShown"' : ''
    }>${label}</label>` +
    `<div class="bpp-field-wrapper" ${
      canBeShown ? 'data-show="isShown"' : ''
    }>` +
    `<div contenteditable="true" id="camunda-${escapeHTML(resource.id)}" ` +
    `name="${escapeHTML(options.modelProperty)}" />` +
    `</div>`;

  // add description below text box entry field
  if (description) {
    resource.html += entryFieldDescription(description);
  }

  if (canBeShown) {
    resource.isShown = function() {
      return options.show.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-textbox'];

  return resource;
};

module.exports = textBox;
