

const assign = require('lodash/assign');

const inputOutputParameter = require('./implementation/InputOutputParameter');

module.exports = function(group, element, bpmnFactory, options, translate) {

  options = assign({
    idPrefix: 'connector-',
    insideConnector: true
  }, options);

  group.entries = group.entries.concat(inputOutputParameter(element, bpmnFactory, options, translate));

};
