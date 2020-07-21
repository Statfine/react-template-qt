

const is = require('bpmn-js/lib/util/ModelUtil').is;
const entryFactory = require('../../../factory/EntryFactory');
const participantHelper = require('../../../helper/ParticipantHelper');
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
const nameEntryFactory = require('./implementation/Name');
const utils = require('../../../Utils');

module.exports = function(group, element, translate, options) {
  const businessObject = getBusinessObject(element);

  const processIdDescription = options && options.processIdDescription;

  if (is(element, 'bpmn:Process') || (is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {

    /**
     * processId
     */
    if (is(element, 'bpmn:Participant')) {
      const idEntry = entryFactory.validationAwareTextField({
        id: 'process-id',
        label: translate('Process Id'),
        description: processIdDescription && translate(processIdDescription),
        modelProperty: 'processId'
      });

      // in participants we have to change the default behavior of set and get
      idEntry.get = function(element) {
        const properties = participantHelper.getProcessBusinessObject(element, 'id');
        return { processId: properties.id };
      };

      idEntry.set = function(element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'id', { id: values.processId });
      };

      idEntry.validate = function(element, values) {
        const idValue = values.processId;

        const bo = getBusinessObject(element);

        const processIdError = utils.isIdValid(bo.processRef, idValue, translate);

        return processIdError ? { processId: processIdError } : {};
      };

      group.entries.push(idEntry);


      /**
       * process name
       */
      const processNameEntry = nameEntryFactory(element, {
        id: 'process-name',
        label: translate('Process Name')
      })[0];

      // in participants we have to change the default behavior of set and get
      processNameEntry.get = function(element) {
        return participantHelper.getProcessBusinessObject(element, 'name');
      };

      processNameEntry.set = function(element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'name', values);
      };

      group.entries.push(processNameEntry);
    }
  }
};
