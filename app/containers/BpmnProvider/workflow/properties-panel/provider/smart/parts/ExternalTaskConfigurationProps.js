

const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

const ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');

const externalTaskPriority = require('./implementation/ExternalTaskPriority');

function getServiceTaskLikeBusinessObject(element) {
  let bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);

  // if the element is not a serviceTaskLike element, fetch the normal business object
  // This avoids the loss of the process / participant business object
  if (!bo) {
    bo = getBusinessObject(element);
  }

  return bo;
}

module.exports = function(group, element, bpmnFactory, translate) {

  const bo = getServiceTaskLikeBusinessObject(element);

  if (!bo) {
    return;
  }

  if (is(bo, 'smart:TaskPriorized') || (is(bo, 'bpmn:Participant')) && bo.get('processRef')) {
    group.entries = group.entries.concat(externalTaskPriority(element, bpmnFactory, {
      getBusinessObject(element) {
        if (!is(bo, 'bpmn:Participant')) {
          return bo;
        }
        return bo.get('processRef');
      }
    }, translate));
  }
};