

const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
const forEach = require('lodash/forEach');
const entryFactory = require('../../../factory/EntryFactory');
const cmdHelper = require('../../../helper/CmdHelper');


function getLinkEventDefinition(element) {

  const bo = getBusinessObject(element);

  let linkEventDefinition = null;
  if (bo.eventDefinitions) {
    forEach(bo.eventDefinitions, function(eventDefinition) {
      if (is(eventDefinition, 'bpmn:LinkEventDefinition')) {
        linkEventDefinition = eventDefinition;
      }
    });
  }

  return linkEventDefinition;
}

module.exports = function(group, element, translate) {
  const linkEvents = [ 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent' ];

  forEach(linkEvents, function(event) {
    if (is(element, event)) {

      const linkEventDefinition = getLinkEventDefinition(element);

      if (linkEventDefinition) {
        const entry = entryFactory.textField({
          id: 'link-event',
          label: translate('Link Name'),
          modelProperty: 'link-name'
        });

        entry.get = function() {
          return { 'link-name': linkEventDefinition.get('name') };
        };

        entry.set = function(element, values) {
          const newProperties = {
            name: values['link-name']
          };
          return cmdHelper.updateBusinessObject(element, linkEventDefinition, newProperties);
        };

        group.entries.push(entry);
      }
    }
  });
};

