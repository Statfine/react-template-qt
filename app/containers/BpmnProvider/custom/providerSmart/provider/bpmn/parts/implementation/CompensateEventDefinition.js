const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const is = require('bpmn-js/lib/util/ModelUtil').is;

const forEach = require('lodash/forEach');
const find = require('lodash/find');
const filter = require('lodash/filter');
const utils = require('../../../../Utils');
const eventDefinitionHelper = require('../../../../helper/EventDefinitionHelper');
const cmdHelper = require('../../../../helper/CmdHelper');
const entryFactory = require('../../../../factory/EntryFactory');

function getContainedActivities(element) {
  return getFlowElements(element, 'bpmn:Activity');
}

function getContainedBoundaryEvents(element) {
  return getFlowElements(element, 'bpmn:BoundaryEvent');
}

function getFlowElements(element, type) {
  return utils.filterElementsByType(element.flowElements, type);
}

function isCompensationEventAttachedToActivity(activity, boundaryEvents) {
  const activityId = activity.id;
  const boundaryEvent = find(boundaryEvents, function(boundaryEvent) {
    const compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(
      boundaryEvent,
    );
    const attachedToRef = boundaryEvent.attachedToRef;
    return (
      compensateEventDefinition &&
      attachedToRef &&
      attachedToRef.id === activityId
    );
  });
  return !!boundaryEvent;
}

// subprocess: only when it is not triggeredByEvent
// activity: only when it attach a compensation boundary event
// callActivity: no limitation
function canActivityBeCompensated(activity, boundaryEvents) {
  return (
    (is(activity, 'bpmn:SubProcess') && !activity.triggeredByEvent) ||
    is(activity, 'bpmn:CallActivity') ||
    isCompensationEventAttachedToActivity(activity, boundaryEvents)
  );
}

function getActivitiesForCompensation(element) {
  const boundaryEvents = getContainedBoundaryEvents(element);
  return filter(getContainedActivities(element), function(activity) {
    return canActivityBeCompensated(activity, boundaryEvents);
  });
}

function getActivitiesForActivityRef(element) {
  const bo = getBusinessObject(element);
  let parent = bo.$parent;

  let activitiesForActivityRef = getActivitiesForCompensation(parent);

  // if throwing compensation event is in an event sub process:
  // get also all activities outside of the event sub process
  if (is(parent, 'bpmn:SubProcess') && parent.triggeredByEvent) {
    parent = parent.$parent;
    if (parent) {
      activitiesForActivityRef = activitiesForActivityRef.concat(
        getActivitiesForCompensation(parent),
      );
    }
  }

  return activitiesForActivityRef;
}

function createActivityRefOptions(element) {
  const options = [{ value: '' }];

  const activities = getActivitiesForActivityRef(element);
  forEach(activities, function(activity) {
    const activityId = activity.id;
    const name = `${
      activity.name ? `${activity.name} ` : ''
    }(id=${activityId})`;
    options.push({ value: activityId, name });
  });

  return options;
}

module.exports = function(
  group,
  element,
  bpmnFactory,
  compensateEventDefinition,
  elementRegistry,
  translate,
) {
  group.entries.push(
    entryFactory.checkbox({
      id: 'wait-for-completion',
      label: translate('Wait for Completion'),
      modelProperty: 'waitForCompletion',

      get(element, node) {
        return {
          waitForCompletion: compensateEventDefinition.waitForCompletion,
        };
      },

      set(element, values) {
        values.waitForCompletion = values.waitForCompletion || false;
        return cmdHelper.updateBusinessObject(
          element,
          compensateEventDefinition,
          values,
        );
      },
    }),
  );

  group.entries.push(
    entryFactory.selectBox({
      id: 'activity-ref',
      label: translate('Activity Ref'),
      selectOptions: createActivityRefOptions(element),
      modelProperty: 'activityRef',

      get(element, node) {
        let activityRef = compensateEventDefinition.activityRef;
        activityRef = activityRef && activityRef.id;
        return {
          activityRef: activityRef || '',
        };
      },

      set(element, values) {
        let activityRef = values.activityRef || undefined;
        activityRef =
          activityRef && getBusinessObject(elementRegistry.get(activityRef));
        return cmdHelper.updateBusinessObject(
          element,
          compensateEventDefinition,
          {
            activityRef,
          },
        );
      },
    }),
  );
};
