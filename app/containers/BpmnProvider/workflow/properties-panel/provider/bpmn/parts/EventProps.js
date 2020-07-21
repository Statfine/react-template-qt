

const is = require('bpmn-js/lib/util/ModelUtil').is;
const isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
const forEach = require('lodash/forEach');
const eventDefinitionHelper = require('../../../helper/EventDefinitionHelper');


const message = require('./implementation/MessageEventDefinition');
const signal = require('./implementation/SignalEventDefinition');
const error = require('./implementation/ErrorEventDefinition');
const escalation = require('./implementation/EscalationEventDefinition');
const timer = require('./implementation/TimerEventDefinition');
const compensation = require('./implementation/CompensateEventDefinition');
const condition = require('./implementation/ConditionalEventDefinition');


module.exports = function(group, element, bpmnFactory, elementRegistry, translate) {
  const events = [
    'bpmn:StartEvent',
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  // Message and Signal Event Definition
  forEach(events, function(event) {
    if (is(element, event)) {

      const messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(element);
      const signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(element);

      if (messageEventDefinition) {
        message(group, element, bpmnFactory, messageEventDefinition, translate);
      }

      if (signalEventDefinition) {
        signal(group, element, bpmnFactory, signalEventDefinition, translate);
      }

    }
  });

  // Special Case: Receive Task
  if (is(element, 'bpmn:ReceiveTask')) {
    message(group, element, bpmnFactory, getBusinessObject(element), translate);
  }

  // Error Event Definition
  const errorEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:EndEvent'
  ];

  forEach(errorEvents, function(event) {
    if (is(element, event)) {

      const errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(element);

      if (errorEventDefinition) {

        error(group, element, bpmnFactory, errorEventDefinition, translate);
      }
    }
  });

  // Escalation Event Definition
  const escalationEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:EndEvent'
  ];

  forEach(escalationEvents, function(event) {
    if (is(element, event)) {

      const showEscalationCodeVariable = is(element, 'bpmn:StartEvent') || is(element, 'bpmn:BoundaryEvent');

      // get business object
      const escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(element);

      if (escalationEventDefinition) {
        escalation(group, element, bpmnFactory, escalationEventDefinition, showEscalationCodeVariable,
          translate);
      }
    }

  });

  // Timer Event Definition
  const timerEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  forEach(timerEvents, function(event) {
    if (is(element, event)) {

      // get business object
      const timerEventDefinition = eventDefinitionHelper.getTimerEventDefinition(element);

      if (timerEventDefinition) {
        timer(group, element, bpmnFactory, timerEventDefinition, translate);
      }
    }
  });

  // Compensate Event Definition
  const compensationEvents = [
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent'
  ];

  forEach(compensationEvents, function(event) {
    if (is(element, event)) {

      // get business object
      const compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(element);

      if (compensateEventDefinition) {
        compensation(group, element, bpmnFactory, compensateEventDefinition, elementRegistry, translate);
      }
    }
  });


  // Conditional Event Definition
  const conditionalEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  if (isAny(element, conditionalEvents)) {

    // get business object
    const conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(element);

    if (conditionalEventDefinition) {
      condition(group, element, bpmnFactory, conditionalEventDefinition, elementRegistry, translate);
    }
  }

};
