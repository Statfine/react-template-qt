const entryFactory = require('../../../factory/EntryFactory');
const cmdHelper = require('../../../helper/CmdHelper');
const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;

module.exports = function (group, element, translate) {
  const bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  if (
    is(element, 'bpmn:Process') ||
    (is(element, 'bpmn:Participant') && bo.get('processRef'))
  ) {
    const versionTagEntry = entryFactory.textField({
      id: 'versionTag',
      label: translate('Version Tag'),
      modelProperty: 'versionTag',
    });

    // in participants we have to change the default behavior of set and get
    if (is(element, 'bpmn:Participant')) {
      versionTagEntry.get = function (element) {
        const processBo = bo.get('processRef');

        return {
          versionTag: processBo.get('smart:versionTag'),
        };
      };

      versionTagEntry.set = function (element, values) {
        const processBo = bo.get('processRef');

        return cmdHelper.updateBusinessObject(element, processBo, {
          'smart:versionTag': values.versionTag || undefined,
        });
      };
    }

    group.entries.push(versionTagEntry);
  }
};
