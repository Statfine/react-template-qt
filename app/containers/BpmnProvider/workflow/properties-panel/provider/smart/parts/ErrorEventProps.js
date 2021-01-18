const is = require('bpmn-js/lib/util/ModelUtil').is;
const forEach = require('lodash/forEach');
const eventDefinitionHelper = require('../../../helper/EventDefinitionHelper');
const error = require('./implementation/ErrorEventDefinition');

module.exports = function (group, element, bpmnFactory, translate) {
  const errorEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:EndEvent',
  ];

  forEach(errorEvents, function (event) {
    if (is(element, event)) {
      const errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(
        element,
      );

      if (errorEventDefinition) {
        const isCatchingErrorEvent =
          is(element, 'bpmn:StartEvent') || is(element, 'bpmn:BoundaryEvent');

        const showErrorCodeVariable = isCatchingErrorEvent;
        const showErrorMessageVariable = isCatchingErrorEvent;

        error(
          group,
          element,
          bpmnFactory,
          errorEventDefinition,
          showErrorCodeVariable,
          showErrorMessageVariable,
          translate,
        );
      }
    }
  });
};
