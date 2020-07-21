

const ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');

const fieldInjection = require('./implementation/FieldInjection');

module.exports = function(group, element, bpmnFactory, translate) {

  const bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);

  if (!bo) {
    return;
  }

  const fieldInjectionEntry = fieldInjection(element, bpmnFactory, translate, { businessObject: bo });

  if (fieldInjectionEntry && fieldInjectionEntry.length > 0) {
    group.entries = group.entries.concat(fieldInjectionEntry);
  }

};
