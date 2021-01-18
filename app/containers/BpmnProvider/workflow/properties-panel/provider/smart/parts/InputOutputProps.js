const inputOutput = require('./implementation/InputOutput');

module.exports = function(group, element, bpmnFactory, translate) {
  const inputOutputEntry = inputOutput(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(inputOutputEntry.entries);

  return {
    getSelectedParameter: inputOutputEntry.getSelectedParameter,
  };
};
