const assign = require('lodash/assign');
const inputOutputParameter = require('./implementation/InputOutputParameter');

module.exports = function(group, element, bpmnFactory, options, translate) {
  group.entries = group.entries.concat(
    inputOutputParameter(element, bpmnFactory, assign({}, options), translate),
  );
};
