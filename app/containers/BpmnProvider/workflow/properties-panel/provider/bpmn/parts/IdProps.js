const entryFactory = require('../../../factory/EntryFactory');
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const utils = require('../../../Utils');
const cmdHelper = require('../../../helper/CmdHelper');

module.exports = function(group, element, translate, options) {
  const description = options && options.description;

  // Id
  group.entries.push(
    entryFactory.validationAwareTextField({
      id: 'id',
      label: translate('Id'),
      description: description && translate(description),
      modelProperty: 'id',
      getProperty(element) {
        return getBusinessObject(element).id;
      },
      setProperty(element, properties) {
        element = element.labelTarget || element;

        return cmdHelper.updateProperties(element, properties);
      },
      validate(element, values) {
        const idValue = values.id;

        const bo = getBusinessObject(element);

        const idError = utils.isIdValid(bo, idValue, translate);

        return idError ? { id: idError } : {};
      },
    }),
  );
};
