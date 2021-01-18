const listener = require('./implementation/Listener');

module.exports = function (group, element, bpmnFactory, translate) {
  const listenerEntry = listener(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(listenerEntry.entries);

  return {
    getSelectedListener: listenerEntry.getSelectedListener,
  };
};
