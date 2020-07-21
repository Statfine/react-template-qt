

const entryFactory = require('../../../../factory/EntryFactory');
const cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function(element, bpmnFactory, options, translate) {

  const getImplementationType = options.getImplementationType;
  const getBusinessObject = options.getBusinessObject;

  function isExternal(element) {
    return getImplementationType(element) === 'external';
  }

  const topicEntry = entryFactory.textField({
    id: 'externalTopic',
    label: translate('Topic'),
    modelProperty: 'externalTopic',

    get(element, node) {
      const bo = getBusinessObject(element);
      return { externalTopic: bo.get('smart:topic') };
    },

    set(element, values, node) {
      const bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'smart:topic': values.externalTopic
      });
    },

    validate(element, values, node) {
      return isExternal(element) && !values.externalTopic ? { externalTopic: translate('Must provide a value') } : {};
    },

    hidden(element, node) {
      return !isExternal(element);
    }

  });

  return [ topicEntry ];

};
