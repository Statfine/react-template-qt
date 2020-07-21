

const entryFactory = require('../../../../factory/EntryFactory');

const cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function(element, bpmnFactory, options, translate) {

  const getBusinessObject = options.getBusinessObject;

  const isStartableInTasklistEntry = entryFactory.checkbox({
    id: 'isStartableInTasklist',
    label: translate('Startable'),
    modelProperty: 'isStartableInTasklist',

    get(element, node) {
      const bo = getBusinessObject(element);
      const isStartableInTasklist = bo.get('smart:isStartableInTasklist');

      return {
        isStartableInTasklist: isStartableInTasklist || ''
      };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'smart:isStartableInTasklist': !!values.isStartableInTasklist
      });
    }

  });

  return [
    isStartableInTasklistEntry
  ];
};
