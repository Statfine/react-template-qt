const entryFactory = require('../../../../factory/EntryFactory');

const cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function (element, bpmnFactory, options, translate) {
  const getBusinessObject = options.getBusinessObject;

  const jobPriorityEntry = entryFactory.textField({
    id: 'jobPriority',
    label: translate('Job Priority'),
    modelProperty: 'jobPriority',

    get(element, node) {
      const bo = getBusinessObject(element);
      return {
        jobPriority: bo.get('smart:jobPriority'),
      };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'smart:jobPriority': values.jobPriority || undefined,
      });
    },
  });

  return [jobPriorityEntry];
};
