const entryFactory = require('../../../../factory/EntryFactory');

const cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function (element, bpmnFactory, options, translate) {
  const getBusinessObject = options.getBusinessObject;

  const externalTaskPriorityEntry = entryFactory.textField({
    id: 'externalTaskPriority',
    label: translate('Task Priority'),
    modelProperty: 'taskPriority',

    get(element, node) {
      const bo = getBusinessObject(element);
      return {
        taskPriority: bo.get('smart:taskPriority'),
      };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'smart:taskPriority': values.taskPriority || undefined,
      });
    },
  });

  return [externalTaskPriorityEntry];
};
