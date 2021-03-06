

const assign = require('lodash/assign');

const fieldInjection = require('./implementation/FieldInjection');

module.exports = function(group, element, bpmnFactory, options, translate) {

  options = assign({
    idPrefix: 'listener-',
    insideListener: true
  }, options);

  const fieldInjectionEntry = fieldInjection(element, bpmnFactory, translate, options);

  if (fieldInjectionEntry && fieldInjectionEntry.length > 0) {
    group.entries = group.entries.concat(fieldInjectionEntry);
  }

};
