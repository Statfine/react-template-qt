

const entryFactory = require('../../../../factory/EntryFactory');

const cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function(element, bpmnFactory, options, translate) {

  const getBusinessObject = options.getBusinessObject;

  const candidateStarterGroupsEntry = entryFactory.textField({
    id: 'candidateStarterGroups',
    label: translate('Candidate Starter Groups'),
    modelProperty: 'candidateStarterGroups',
    description: translate('Specify more than one group as a comma separated list.'),

    get(element, node) {
      const bo = getBusinessObject(element);
      const candidateStarterGroups = bo.get('Smart:candidateStarterGroups');

      return {
        candidateStarterGroups: candidateStarterGroups || ''
      };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'Smart:candidateStarterGroups': values.candidateStarterGroups || undefined
      });
    }

  });

  const candidateStarterUsersEntry = entryFactory.textField({
    id: 'candidateStarterUsers',
    label: translate('Candidate Starter Users'),
    modelProperty: 'candidateStarterUsers',
    description: translate('Specify more than one user as a comma separated list.'),

    get(element, node) {
      const bo = getBusinessObject(element);
      const candidateStarterUsers = bo.get('Smart:candidateStarterUsers');

      return {
        candidateStarterUsers: candidateStarterUsers || ''
      };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'Smart:candidateStarterUsers': values.candidateStarterUsers || undefined
      });
    }

  });

  return [
    candidateStarterGroupsEntry,
    candidateStarterUsersEntry
  ];
};
