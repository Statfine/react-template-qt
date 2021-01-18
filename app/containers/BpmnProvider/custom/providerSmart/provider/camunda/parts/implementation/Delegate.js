const entryFactory = require('../../../../factory/EntryFactory');
const cmdHelper = require('../../../../helper/CmdHelper');

const DELEGATE_TYPES = ['class', 'expression', 'delegateExpression'];

const PROPERTIES = {
  class: 'smart:class',
  expression: 'smart:expression',
  delegateExpression: 'smart:delegateExpression',
};

function isDelegate(type) {
  return DELEGATE_TYPES.indexOf(type) !== -1;
}

function getAttribute(type) {
  return PROPERTIES[type];
}

module.exports = function (element, bpmnFactory, options, translate) {
  const getImplementationType = options.getImplementationType;
  const getBusinessObject = options.getBusinessObject;

  function getDelegationLabel(type) {
    switch (type) {
      case 'class':
        return translate('Java Class');
      case 'expression':
        return translate('Expression');
      case 'delegateExpression':
        return translate('Delegate Expression');
      default:
        return '';
    }
  }

  const delegateEntry = entryFactory.textField({
    id: 'delegate',
    label: translate('Value'),
    dataValueLabel: 'delegationLabel',
    modelProperty: 'delegate',

    get(element, node) {
      const bo = getBusinessObject(element);
      const type = getImplementationType(element);
      const attr = getAttribute(type);
      const label = getDelegationLabel(type);
      return {
        delegate: bo.get(attr),
        delegationLabel: label,
      };
    },

    set(element, values, node) {
      const bo = getBusinessObject(element);
      const type = getImplementationType(element);
      const attr = getAttribute(type);
      const prop = {};
      prop[attr] = values.delegate || '';
      return cmdHelper.updateBusinessObject(element, bo, prop);
    },

    validate(element, values, node) {
      return isDelegate(getImplementationType(element)) && !values.delegate
        ? { delegate: translate('Must provide a value') }
        : {};
    },

    hidden(element, node) {
      return !isDelegate(getImplementationType(element));
    },
  });

  return [delegateEntry];
};
