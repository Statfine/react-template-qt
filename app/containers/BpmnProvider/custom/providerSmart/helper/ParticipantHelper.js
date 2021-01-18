const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const cmdHelper = require('./CmdHelper');

const ParticipantHelper = {};

module.exports = ParticipantHelper;

ParticipantHelper.modifyProcessBusinessObject = function (
  element,
  property,
  values,
) {
  if (!is(element, 'bpmn:Participant')) {
    return {};
  }

  const bo = getBusinessObject(element).get('processRef');
  const properties = {};

  properties[property] = values[property];

  return cmdHelper.updateBusinessObject(element, bo, properties);
};

ParticipantHelper.getProcessBusinessObject = function (element, propertyName) {
  if (!is(element, 'bpmn:Participant')) {
    return {};
  }

  const bo = getBusinessObject(element).get('processRef');
  const properties = {};

  properties[propertyName] = bo.get(propertyName);

  return properties;
};
