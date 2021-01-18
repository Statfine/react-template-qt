const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const is = require('bpmn-js/lib/util/ModelUtil').is;

const flattenDeep = require('lodash/flattenDeep');
const assign = require('lodash/assign');
const entryFactory = require('../../../factory/EntryFactory');

const callable = require('./implementation/Callable');

const cmdHelper = require('../../../helper/CmdHelper');

function getCallableType(element) {
  const bo = getBusinessObject(element);

  const boCalledElement = bo.get('calledElement');
  const boCaseRef = bo.get('smart:caseRef');

  let callActivityType = '';
  if (typeof boCalledElement !== 'undefined') {
    callActivityType = 'bpmn';
  } else if (typeof boCaseRef !== 'undefined') {
    callActivityType = 'cmmn';
  }

  return callActivityType;
}

const DEFAULT_PROPS = {
  calledElement: undefined,
  'smart:calledElementBinding': 'latest',
  'smart:calledElementVersion': undefined,
  'smart:calledElementTenantId': undefined,
  'smart:variableMappingClass': undefined,
  'smart:variableMappingDelegateExpression': undefined,
  'smart:caseRef': undefined,
  'smart:caseBinding': 'latest',
  'smart:caseVersion': undefined,
  'smart:caseTenantId': undefined,
};

module.exports = function(group, element, bpmnFactory, translate) {
  if (!is(element, 'smart:CallActivity')) {
    return;
  }

  group.entries.push(
    entryFactory.selectBox({
      id: 'callActivity',
      label: translate('CallActivity Type'),
      selectOptions: [
        { name: 'BPMN', value: 'bpmn' },
        { name: 'CMMN', value: 'cmmn' },
      ],
      emptyParameter: true,
      modelProperty: 'callActivityType',

      get(element, node) {
        return {
          callActivityType: getCallableType(element),
        };
      },

      set(element, values, node) {
        const type = values.callActivityType;

        const props = assign({}, DEFAULT_PROPS);

        if (type === 'bpmn') {
          props.calledElement = '';
        } else if (type === 'cmmn') {
          props['smart:caseRef'] = '';
        }

        return cmdHelper.updateProperties(element, props);
      },
    }),
  );

  group.entries.push(
    callable(
      element,
      bpmnFactory,
      {
        getCallableType,
      },
      translate,
    ),
  );

  group.entries = flattenDeep(group.entries);
};
