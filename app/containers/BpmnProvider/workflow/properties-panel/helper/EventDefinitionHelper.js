

const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
const is = require('bpmn-js/lib/util/ModelUtil').is;
const forEach = require('lodash/forEach');

const EventDefinitionHelper = {};

module.exports = EventDefinitionHelper;

EventDefinitionHelper.getEventDefinition = function(element, eventType) {

  const bo = getBusinessObject(element);
  let eventDefinition = null;

  if (bo.eventDefinitions) {
    forEach(bo.eventDefinitions, function(event) {
      if (is(event, eventType)) {
        eventDefinition = event;
      }
    });
  }

  return eventDefinition;
};

EventDefinitionHelper.getTimerEventDefinition = function(element) {
  return this.getEventDefinition(element, 'bpmn:TimerEventDefinition');
};

EventDefinitionHelper.getMessageEventDefinition = function(element) {
  return this.getEventDefinition(element, 'bpmn:MessageEventDefinition');
};

EventDefinitionHelper.getSignalEventDefinition = function(element) {
  return this.getEventDefinition(element, 'bpmn:SignalEventDefinition');
};

EventDefinitionHelper.getErrorEventDefinition = function(element) {
  return this.getEventDefinition(element, 'bpmn:ErrorEventDefinition');
};

EventDefinitionHelper.getEscalationEventDefinition = function(element) {
  return this.getEventDefinition(element, 'bpmn:EscalationEventDefinition');
};

EventDefinitionHelper.getCompensateEventDefinition = function(element) {
  return this.getEventDefinition(element, 'bpmn:CompensateEventDefinition');
};

EventDefinitionHelper.getLinkEventDefinition = function(element) {
  return this.getEventDefinition(element, 'bpmn:LinkEventDefinition');
};

EventDefinitionHelper.getConditionalEventDefinition = function(element) {
  return this.getEventDefinition(element, 'bpmn:ConditionalEventDefinition');
};
