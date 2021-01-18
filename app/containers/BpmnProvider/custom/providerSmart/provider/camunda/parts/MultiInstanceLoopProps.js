const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const is = require('bpmn-js/lib/util/ModelUtil').is;

const multiInstanceLoopCharacteristics = require('./implementation/MultiInstanceLoopCharacteristics');

const jobRetryTimeCycle = require('./implementation/JobRetryTimeCycle');
const asyncContinuation = require('./implementation/AsyncContinuation');

function getLoopCharacteristics(element) {
  const bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}

function ensureMultiInstanceSupported(element) {
  const loopCharacteristics = getLoopCharacteristics(element);
  return !!loopCharacteristics && is(loopCharacteristics, 'smart:Collectable');
}

module.exports = function (group, element, bpmnFactory, translate) {
  if (!ensureMultiInstanceSupported(element)) {
    return;
  }

  // multi instance properties
  group.entries = group.entries.concat(
    multiInstanceLoopCharacteristics(element, bpmnFactory, translate),
  );

  // async continuation ///////////////////////////////////////////////////////
  group.entries = group.entries.concat(
    asyncContinuation(
      element,
      bpmnFactory,
      {
        getBusinessObject: getLoopCharacteristics,
        idPrefix: 'multiInstance-',
        labelPrefix: translate('Multi Instance '),
      },
      translate,
    ),
  );

  // retry time cycle //////////////////////////////////////////////////////////
  group.entries = group.entries.concat(
    jobRetryTimeCycle(
      element,
      bpmnFactory,
      {
        getBusinessObject: getLoopCharacteristics,
        idPrefix: 'multiInstance-',
        labelPrefix: translate('Multi Instance '),
      },
      translate,
    ),
  );
};
