import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'; // 引入默认的renderer
const HIGH_PRIORITY = 1500; // 最高优先级

const propertiesConfig = {
  // 'bpmn:StartEvent': {
  //   fill: '#12c2e9'
  // },
  'bpmn:Task': {
    stroke: '#c471ed',
    fill: '#F0F6FF',
    strokeWidth: 1,
  },
  // 'bpmn:EndEvent': {
  //   stroke: '#f64f59',
  //   fill: '#f64f59'
  // }
};

function setShapeProperties(shape, element) {
  const type = element.type; // 获取到的类型
  if (propertiesConfig[type]) {
    const properties = propertiesConfig[type];
    Object.keys(properties).forEach(prop => {
      shape.style.setProperty(prop, properties[prop]);
    });
  }
}

export default class CustomRenderer extends BaseRenderer {
  // 继承BaseRenderer
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element) {
    // ignore labels
    return !element.labelTarget;
  }

  drawShape(parentNode, element) {
    // 核心函数就是绘制shape
    const shape = this.bpmnRenderer.drawShape(parentNode, element);
    setShapeProperties(shape, element);
    return shape;
  }

  getShapePath(shape) {
    return this.bpmnRenderer.getShapePath(shape);
  }
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer'];
