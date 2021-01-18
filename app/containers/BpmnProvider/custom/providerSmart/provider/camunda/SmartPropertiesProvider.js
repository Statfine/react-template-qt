const inherits = require('inherits');

const PropertiesActivator = require('../../PropertiesActivator');

const asyncCapableHelper = require('../../helper/AsyncCapableHelper');
const ImplementationTypeHelper = require('../../helper/ImplementationTypeHelper');

const is = require('bpmn-js/lib/util/ModelUtil').is;

// bpmn properties
const processProps = require('../bpmn/parts/ProcessProps');
const eventProps = require('../bpmn/parts/EventProps');
const linkProps = require('../bpmn/parts/LinkProps');
const documentationProps = require('../bpmn/parts/DocumentationProps');
const idProps = require('../bpmn/parts/IdProps');
const nameProps = require('../bpmn/parts/NameProps');
const executableProps = require('../bpmn/parts/ExecutableProps');

// camunda properties
const serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps');
const userTaskProps = require('./parts/UserTaskProps');
const asynchronousContinuationProps = require('./parts/AsynchronousContinuationProps');
const callActivityProps = require('./parts/CallActivityProps');
const multiInstanceProps = require('./parts/MultiInstanceLoopProps');
const conditionalProps = require('./parts/ConditionalProps');
const scriptProps = require('./parts/ScriptTaskProps');
const errorProps = require('./parts/ErrorEventProps');
const formProps = require('./parts/FormProps');
const startEventInitiator = require('./parts/StartEventInitiator');
const variableMapping = require('./parts/VariableMappingProps');
const versionTag = require('./parts/VersionTagProps');

const listenerProps = require('./parts/ListenerProps');
const listenerDetails = require('./parts/ListenerDetailProps');
const listenerFields = require('./parts/ListenerFieldInjectionProps');

const elementTemplateChooserProps = require('./element-templates/parts/ChooserProps');
const elementTemplateCustomProps = require('./element-templates/parts/CustomProps');

// Input/Output
const inputOutput = require('./parts/InputOutputProps');
const inputOutputParameter = require('./parts/InputOutputParameterProps');

// Connector
const connectorDetails = require('./parts/ConnectorDetailProps');
const connectorInputOutput = require('./parts/ConnectorInputOutputProps');
const connectorInputOutputParameter = require('./parts/ConnectorInputOutputParameterProps');

// properties
const properties = require('./parts/PropertiesProps');

// job configuration
const jobConfiguration = require('./parts/JobConfigurationProps');

// history time to live
const historyTimeToLive = require('./parts/HistoryTimeToLiveProps');

// candidate starter groups/users
const candidateStarter = require('./parts/CandidateStarterProps');

// tasklist
const tasklist = require('./parts/TasklistProps');

// external task configuration
const externalTaskConfiguration = require('./parts/ExternalTaskConfigurationProps');

// field injection
const fieldInjections = require('./parts/FieldInjectionProps');

const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const eventDefinitionHelper = require('../../helper/EventDefinitionHelper');
const implementationTypeHelper = require('../../helper/ImplementationTypeHelper');

// helpers ////////////////////////////////////////

const isExternalTaskPriorityEnabled = function(element) {
  const businessObject = getBusinessObject(element);

  // show only if element is a process, a participant ...
  if (
    is(element, 'bpmn:Process') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  ) {
    return true;
  }

  const externalBo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(
    element,
  );
  const isExternalTask =
    ImplementationTypeHelper.getImplementationType(externalBo) === 'external';

  // ... or an external task with selected external implementation type
  return (
    !!ImplementationTypeHelper.isExternalCapable(externalBo) && isExternalTask
  );
};

const isJobConfigEnabled = function(element) {
  const businessObject = getBusinessObject(element);

  if (
    is(element, 'bpmn:Process') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  ) {
    return true;
  }

  // async behavior
  const bo = getBusinessObject(element);
  if (
    asyncCapableHelper.isAsyncBefore(bo) ||
    asyncCapableHelper.isAsyncAfter(bo)
  ) {
    return true;
  }

  // timer definition
  if (is(element, 'bpmn:Event')) {
    return !!eventDefinitionHelper.getTimerEventDefinition(element);
  }

  return false;
};

const getInputOutputParameterLabel = function(param, translate) {
  if (is(param, 'camunda:InputParameter')) {
    return translate('Input Parameter');
  }

  if (is(param, 'camunda:OutputParameter')) {
    return translate('Output Parameter');
  }

  return '';
};

const getListenerLabel = function(param, translate) {
  if (is(param, 'camunda:ExecutionListener')) {
    return translate('Execution Listener');
  }

  if (is(param, 'camunda:TaskListener')) {
    return translate('Task Listener');
  }

  return '';
};

const PROCESS_KEY_HINT = 'This maps to the process definition key.';
const TASK_KEY_HINT = 'This maps to the task definition key.';

function createGeneralTabGroups(
  element,
  canvas,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate,
) {
  // refer to target element for external labels
  element = element.labelTarget || element;

  const generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: [],
  };

  let idOptions;
  let processOptions;

  if (is(element, 'bpmn:Process')) {
    idOptions = { description: PROCESS_KEY_HINT };
  }

  if (is(element, 'bpmn:UserTask')) {
    idOptions = { description: TASK_KEY_HINT };
  }

  if (is(element, 'bpmn:Participant')) {
    processOptions = { processIdDescription: PROCESS_KEY_HINT };
  }

  idProps(generalGroup, element, translate, idOptions);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate, processOptions);
  versionTag(generalGroup, element, translate);
  executableProps(generalGroup, element, translate);
  elementTemplateChooserProps(
    generalGroup,
    element,
    elementTemplates,
    translate,
  );

  const customFieldsGroups = elementTemplateCustomProps(
    element,
    elementTemplates,
    bpmnFactory,
    translate,
  );

  const detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: [],
  };
  serviceTaskDelegateProps(detailsGroup, element, bpmnFactory, translate);
  userTaskProps(detailsGroup, element, translate);
  scriptProps(detailsGroup, element, bpmnFactory, translate);
  linkProps(detailsGroup, element, translate);
  callActivityProps(detailsGroup, element, bpmnFactory, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
  errorProps(detailsGroup, element, bpmnFactory, translate);
  conditionalProps(detailsGroup, element, bpmnFactory, translate);
  startEventInitiator(detailsGroup, element, translate); // this must be the last element of the details group!

  const multiInstanceGroup = {
    id: 'multiInstance',
    label: translate('Multi Instance'),
    entries: [],
  };
  multiInstanceProps(multiInstanceGroup, element, bpmnFactory, translate);

  const asyncGroup = {
    id: 'async',
    label: translate('Asynchronous Continuations'),
    entries: [],
  };
  asynchronousContinuationProps(asyncGroup, element, bpmnFactory, translate);

  const jobConfigurationGroup = {
    id: 'jobConfiguration',
    label: translate('Job Configuration'),
    entries: [],
    enabled: isJobConfigEnabled,
  };
  jobConfiguration(jobConfigurationGroup, element, bpmnFactory, translate);

  const externalTaskGroup = {
    id: 'externalTaskConfiguration',
    label: translate('External Task Configuration'),
    entries: [],
    enabled: isExternalTaskPriorityEnabled,
  };
  externalTaskConfiguration(externalTaskGroup, element, bpmnFactory, translate);

  const candidateStarterGroup = {
    id: 'candidateStarterConfiguration',
    label: translate('Candidate Starter Configuration'),
    entries: [],
  };
  candidateStarter(candidateStarterGroup, element, bpmnFactory, translate);

  const historyTimeToLiveGroup = {
    id: 'historyConfiguration',
    label: translate('History Configuration'),
    entries: [],
  };
  historyTimeToLive(historyTimeToLiveGroup, element, bpmnFactory, translate);

  const tasklistGroup = {
    id: 'tasklist',
    label: translate('Tasklist Configuration'),
    entries: [],
  };
  tasklist(tasklistGroup, element, bpmnFactory, translate);

  const documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: [],
  };
  documentationProps(documentationGroup, element, bpmnFactory, translate);

  const groups = [];
  groups.push(generalGroup);
  customFieldsGroups.forEach(function(group) {
    groups.push(group);
  });
  groups.push(detailsGroup);
  groups.push(externalTaskGroup);
  groups.push(multiInstanceGroup);
  groups.push(asyncGroup);
  groups.push(jobConfigurationGroup);
  groups.push(candidateStarterGroup);
  groups.push(historyTimeToLiveGroup);
  groups.push(tasklistGroup);
  groups.push(documentationGroup);

  return groups;
}

function createVariablesTabGroups(
  element,
  bpmnFactory,
  elementRegistry,
  translate,
) {
  const variablesGroup = {
    id: 'variables',
    label: translate('Variables'),
    entries: [],
  };
  variableMapping(variablesGroup, element, bpmnFactory, translate);

  return [variablesGroup];
}

function createFormsTabGroups(
  element,
  bpmnFactory,
  elementRegistry,
  translate,
) {
  const formGroup = {
    id: 'forms',
    label: translate('Forms'),
    entries: [],
  };
  formProps(formGroup, element, bpmnFactory, translate);

  return [formGroup];
}

function createListenersTabGroups(
  element,
  bpmnFactory,
  elementRegistry,
  translate,
) {
  const listenersGroup = {
    id: 'listeners',
    label: translate('Listeners'),
    entries: [],
  };

  const options = listenerProps(
    listenersGroup,
    element,
    bpmnFactory,
    translate,
  );

  const listenerDetailsGroup = {
    id: 'listener-details',
    entries: [],
    enabled(element, node) {
      return options.getSelectedListener(element, node);
    },
    label(element, node) {
      const param = options.getSelectedListener(element, node);
      return getListenerLabel(param, translate);
    },
  };

  listenerDetails(
    listenerDetailsGroup,
    element,
    bpmnFactory,
    options,
    translate,
  );

  const listenerFieldsGroup = {
    id: 'listener-fields',
    label: translate('Field Injection'),
    entries: [],
    enabled(element, node) {
      return options.getSelectedListener(element, node);
    },
  };

  listenerFields(listenerFieldsGroup, element, bpmnFactory, options, translate);

  return [listenersGroup, listenerDetailsGroup, listenerFieldsGroup];
}

function createInputOutputTabGroups(
  element,
  bpmnFactory,
  elementRegistry,
  translate,
) {
  const inputOutputGroup = {
    id: 'input-output',
    label: translate('Parameters'),
    entries: [],
  };

  const options = inputOutput(
    inputOutputGroup,
    element,
    bpmnFactory,
    translate,
  );

  const inputOutputParameterGroup = {
    id: 'input-output-parameter',
    entries: [],
    enabled(element, node) {
      return options.getSelectedParameter(element, node);
    },
    label(element, node) {
      const param = options.getSelectedParameter(element, node);
      return getInputOutputParameterLabel(param, translate);
    },
  };

  inputOutputParameter(
    inputOutputParameterGroup,
    element,
    bpmnFactory,
    options,
    translate,
  );

  return [inputOutputGroup, inputOutputParameterGroup];
}

function createConnectorTabGroups(
  element,
  bpmnFactory,
  elementRegistry,
  translate,
) {
  const connectorDetailsGroup = {
    id: 'connector-details',
    label: translate('Details'),
    entries: [],
  };

  connectorDetails(connectorDetailsGroup, element, bpmnFactory, translate);

  const connectorInputOutputGroup = {
    id: 'connector-input-output',
    label: translate('Input/Output'),
    entries: [],
  };

  const options = connectorInputOutput(
    connectorInputOutputGroup,
    element,
    bpmnFactory,
    translate,
  );

  const connectorInputOutputParameterGroup = {
    id: 'connector-input-output-parameter',
    entries: [],
    enabled(element, node) {
      return options.getSelectedParameter(element, node);
    },
    label(element, node) {
      const param = options.getSelectedParameter(element, node);
      return getInputOutputParameterLabel(param, translate);
    },
  };

  connectorInputOutputParameter(
    connectorInputOutputParameterGroup,
    element,
    bpmnFactory,
    options,
    translate,
  );

  return [
    connectorDetailsGroup,
    connectorInputOutputGroup,
    connectorInputOutputParameterGroup,
  ];
}

function createFieldInjectionsTabGroups(
  element,
  bpmnFactory,
  elementRegistry,
  translate,
) {
  const fieldGroup = {
    id: 'field-injections-properties',
    label: translate('Field Injections'),
    entries: [],
  };

  fieldInjections(fieldGroup, element, bpmnFactory, translate);

  return [fieldGroup];
}

function createExtensionElementsGroups(
  element,
  bpmnFactory,
  elementRegistry,
  translate,
) {
  const propertiesGroup = {
    id: 'extensionElements-properties',
    label: translate('Properties'),
    entries: [],
  };
  properties(propertiesGroup, element, bpmnFactory, translate);

  return [propertiesGroup];
}

// Camunda Properties Provider /////////////////////////////////////

/**
 * A properties provider for Camunda related properties.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {BpmnFactory} bpmnFactory
 * @param {ElementRegistry} elementRegistry
 * @param {ElementTemplates} elementTemplates
 * @param {Translate} translate
 */
function CamundaPropertiesProvider(
  eventBus,
  canvas,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate,
) {
  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {
    const generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(
        element,
        canvas,
        bpmnFactory,
        elementRegistry,
        elementTemplates,
        translate,
      ),
    };

    const variablesTab = {
      id: 'variables',
      label: translate('Variables'),
      groups: createVariablesTabGroups(
        element,
        bpmnFactory,
        elementRegistry,
        translate,
      ),
    };

    const formsTab = {
      id: 'forms',
      label: translate('Forms'),
      groups: createFormsTabGroups(
        element,
        bpmnFactory,
        elementRegistry,
        translate,
      ),
    };

    const listenersTab = {
      id: 'listeners',
      label: translate('Listeners'),
      groups: createListenersTabGroups(
        element,
        bpmnFactory,
        elementRegistry,
        translate,
      ),
      enabled(element) {
        return (
          !eventDefinitionHelper.getLinkEventDefinition(element) ||
          (!is(element, 'bpmn:IntermediateThrowEvent') &&
            eventDefinitionHelper.getLinkEventDefinition(element))
        );
      },
    };

    const inputOutputTab = {
      id: 'input-output',
      label: translate('Input/Output'),
      groups: createInputOutputTabGroups(
        element,
        bpmnFactory,
        elementRegistry,
        translate,
      ),
    };

    const connectorTab = {
      id: 'connector',
      label: translate('Connector'),
      groups: createConnectorTabGroups(
        element,
        bpmnFactory,
        elementRegistry,
        translate,
      ),
      enabled(element) {
        const bo = implementationTypeHelper.getServiceTaskLikeBusinessObject(
          element,
        );
        return (
          bo &&
          implementationTypeHelper.getImplementationType(bo) === 'connector'
        );
      },
    };

    const fieldInjectionsTab = {
      id: 'field-injections',
      label: translate('Field Injections'),
      groups: createFieldInjectionsTabGroups(
        element,
        bpmnFactory,
        elementRegistry,
        translate,
      ),
    };

    const extensionsTab = {
      id: 'extensionElements',
      label: translate('Extensions'),
      groups: createExtensionElementsGroups(
        element,
        bpmnFactory,
        elementRegistry,
        translate,
      ),
    };

    return [
      generalTab,
      variablesTab,
      connectorTab,
      formsTab,
      listenersTab,
      inputOutputTab,
      fieldInjectionsTab,
      extensionsTab,
    ];
  };
}

CamundaPropertiesProvider.$inject = [
  'eventBus',
  'canvas',
  'bpmnFactory',
  'elementRegistry',
  'elementTemplates',
  'translate',
];

inherits(CamundaPropertiesProvider, PropertiesActivator);

module.exports = CamundaPropertiesProvider;
