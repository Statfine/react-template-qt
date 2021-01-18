const entryFactory = require('../../../../factory/EntryFactory');

const cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function(element, bpmnFactory, options, translate) {
  const getBusinessObject = options.getBusinessObject;

  const historyTimeToLiveEntry = entryFactory.textField({
    id: 'historyTimeToLive',
    label: translate('History Time To Live'),
    modelProperty: 'historyTimeToLive',

    get(element, node) {
      const bo = getBusinessObject(element);
      const historyTimeToLive = bo.get('smart:historyTimeToLive');

      return {
        historyTimeToLive: historyTimeToLive || '',
      };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'smart:historyTimeToLive': values.historyTimeToLive || undefined,
      });
    },
  });

  return [historyTimeToLiveEntry];
};
