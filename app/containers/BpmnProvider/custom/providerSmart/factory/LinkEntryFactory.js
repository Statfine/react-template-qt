const escapeHTML = require('../Utils').escapeHTML;

const entryFieldDescription = require('./EntryFieldDescription');

const bind = require('lodash/bind');

/**
 * An entry that renders a clickable link.
 *
 * A passed {@link options#handleClick} handler is responsible
 * to process the click.
 *
 * The link may be conditionally shown or hidden. This can be
 * controlled via the {@link options.showLink}.
 *
 * @param {Object} options
 * @param {String} options.id
 * @param {String} [options.label]
 * @param {Function} options.handleClick
 * @param {Function} [options.showLink] returning false to hide link
 * @param {String} [options.description]
 *
 * @example
 *
 * var linkEntry = link({
 *   id: 'foo',
 *   description: 'Some Description',
 *   handleClick: function(element, node, event) { ... },
 *   showLink: function(element, node) { ... }
 * });
 *
 * @return {Entry} the newly created entry
 */
function link(options) {
  const id = options.id;
  const label = options.label || id;
  const showLink = options.showLink;
  const handleClick = options.handleClick;
  const description = options.description;

  if (showLink && typeof showLink !== 'function') {
    throw new Error('options.showLink must be a function');
  }

  if (typeof handleClick !== 'function') {
    throw new Error('options.handleClick must be a function');
  }

  const resource = {
    id,
  };

  resource.html = `<a data-action="handleClick" ${
    showLink ? 'data-show="showLink" ' : ''
  }class="bpp-entry-link${
    options.cssClasses ? ` ${escapeHTML(options.cssClasses)}` : ''
  }">${escapeHTML(label)}</a>`;

  // add description below link entry field
  if (description) {
    resource.html += entryFieldDescription(description);
  }

  resource.handleClick = bind(handleClick, resource);

  if (typeof showLink === 'function') {
    resource.showLink = function () {
      return showLink.apply(resource, arguments);
    };
  }

  return resource;
}

module.exports = link;
