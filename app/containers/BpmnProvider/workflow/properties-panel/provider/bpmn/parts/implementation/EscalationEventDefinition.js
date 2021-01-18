const entryFactory = require('../../../../factory/EntryFactory');
const cmdHelper = require('../../../../helper/CmdHelper');

const eventDefinitionReference = require('./EventDefinitionReference');
const elementReferenceProperty = require('./ElementReferenceProperty');

module.exports = function(
  group,
  element,
  bpmnFactory,
  escalationEventDefinition,
  showEscalationCodeVariable,
  translate,
) {
  group.entries = group.entries.concat(
    eventDefinitionReference(element, escalationEventDefinition, bpmnFactory, {
      label: translate('Escalation'),
      elementName: 'escalation',
      elementType: 'bpmn:Escalation',
      referenceProperty: 'escalationRef',
      newElementIdPrefix: 'Escalation_',
    }),
  );

  group.entries = group.entries.concat(
    elementReferenceProperty(element, escalationEventDefinition, bpmnFactory, {
      id: 'escalation-element-name',
      label: translate('Escalation Name'),
      referenceProperty: 'escalationRef',
      modelProperty: 'name',
      shouldValidate: true,
    }),
  );

  group.entries = group.entries.concat(
    elementReferenceProperty(element, escalationEventDefinition, bpmnFactory, {
      id: 'escalation-element-code',
      label: translate('Escalation Code'),
      referenceProperty: 'escalationRef',
      modelProperty: 'escalationCode',
    }),
  );

  if (showEscalationCodeVariable) {
    group.entries.push(
      entryFactory.textField({
        id: 'escalationCodeVariable',
        label: translate('Escalation Code Variable'),
        modelProperty: 'escalationCodeVariable',

        get(element) {
          const codeVariable = escalationEventDefinition.get(
            'camunda:escalationCodeVariable',
          );
          return {
            escalationCodeVariable: codeVariable,
          };
        },

        set(element, values) {
          return cmdHelper.updateBusinessObject(
            element,
            escalationEventDefinition,
            {
              'camunda:escalationCodeVariable':
                values.escalationCodeVariable || undefined,
            },
          );
        },
      }),
    );
  }
};
