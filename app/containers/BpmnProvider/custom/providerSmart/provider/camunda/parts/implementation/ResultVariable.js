

const is = require('bpmn-js/lib/util/ModelUtil').is;

const assign = require('lodash/assign');

const entryFactory = require('../../../../factory/EntryFactory');
const cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function(element, bpmnFactory, options, translate) {

  const getBusinessObject = options.getBusinessObject;
  const hideResultVariable = options.hideResultVariable;
  const id = options.id || 'resultVariable';


  var resultVariableEntry = entryFactory.textField({
    id,
    label: translate('Result Variable'),
    modelProperty: 'resultVariable',

    get(element, node) {
      const bo = getBusinessObject(element);
      return { resultVariable: bo.get('smart:resultVariable') };
    },

    set(element, values, node) {
      const bo = getBusinessObject(element);

      const resultVariable = values.resultVariable || undefined;

      let props = {
        'smart:resultVariable': resultVariable
      };

      if (is(bo, 'smart:DmnCapable') && !resultVariable) {
        props = assign({ 'smart:mapDecisionResult': 'resultList' }, props);
      }

      return cmdHelper.updateBusinessObject(element, bo, props);
    },

    hidden(element, node) {
      if (typeof hideResultVariable === 'function') {
        return hideResultVariable.apply(resultVariableEntry, arguments);
      }
    }

  });

  return [ resultVariableEntry ];

};
