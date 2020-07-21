


const inherits = require('inherits');

const PropertiesActivator = require('../../PropertiesActivator');

const processProps = require('./parts/ProcessProps');
const eventProps = require('./parts/EventProps');
const linkProps = require('./parts/LinkProps');
const documentationProps = require('./parts/DocumentationProps');
const idProps = require('./parts/IdProps');
const nameProps = require('./parts/NameProps');
const executableProps = require('./parts/ExecutableProps');

function createGeneralTabGroups(
  element, canvas, bpmnFactory,
  elementRegistry, translate) {

  const generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate);
  executableProps(generalGroup, element, translate);

  const detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: []
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

  const documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: []
  };

  documentationProps(documentationGroup, element, bpmnFactory, translate);

  return [
    generalGroup,
    detailsGroup,
    documentationGroup
  ];

}

function BpmnPropertiesProvider(
  eventBus, canvas, bpmnFactory, elementRegistry, translate) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

    const generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(
        element, canvas, bpmnFactory, elementRegistry, translate)
    };

    return [
      generalTab
    ];
  };
}

BpmnPropertiesProvider.$inject = [
  'eventBus',
  'canvas',
  'bpmnFactory',
  'elementRegistry',
  'translate'
];

inherits(BpmnPropertiesProvider, PropertiesActivator);

module.exports = BpmnPropertiesProvider;
