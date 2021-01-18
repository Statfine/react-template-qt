const ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');
const InputOutputHelper = require('../../../helper/InputOutputHelper');

const entryFactory = require('../../../factory/EntryFactory');
const cmdHelper = require('../../../helper/CmdHelper');

function getImplementationType(element) {
  return ImplementationTypeHelper.getImplementationType(element);
}

function getBusinessObject(element) {
  return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function getConnector(bo) {
  return InputOutputHelper.getConnector(bo);
}

function isConnector(element) {
  return getImplementationType(element) === 'connector';
}

module.exports = function(group, element, bpmnFactory, translate) {
  group.entries.push(
    entryFactory.textField({
      id: 'connectorId',
      label: translate('Connector Id'),
      modelProperty: 'connectorId',

      get(element, node) {
        const bo = getBusinessObject(element);
        const connector = bo && getConnector(bo);
        const value = connector && connector.get('connectorId');
        return { connectorId: value };
      },

      set(element, values, node) {
        const bo = getBusinessObject(element);
        const connector = getConnector(bo);
        return cmdHelper.updateBusinessObject(element, connector, {
          connectorId: values.connectorId || undefined,
        });
      },

      validate(element, values, node) {
        return isConnector(element) && !values.connectorId
          ? { connectorId: translate('Must provide a value') }
          : {};
      },

      hidden(element, node) {
        return !isConnector(element);
      },
    }),
  );
};
