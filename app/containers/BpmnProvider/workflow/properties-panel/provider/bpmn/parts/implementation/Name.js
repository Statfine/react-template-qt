const entryFactory = require('../../../../factory/EntryFactory');

/**
 * Create an entry to modify the name of an an element.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} options
 * @param  {string} options.id the id of the entry
 * @param  {string} options.label the label of the entry
 *
 * @return {Array<Object>} return an array containing
 *                         the entry to modify the name
 */
module.exports = function(element, options, translate) {
  options = options || {};
  const id = options.id || 'name';
  const label = options.label || translate('Name');
  const modelProperty = options.modelProperty || 'name';

  const nameEntry = entryFactory.textBox({
    id,
    label,
    modelProperty,
    get: options.get,
    set: options.set,
  });

  return [nameEntry];
};
