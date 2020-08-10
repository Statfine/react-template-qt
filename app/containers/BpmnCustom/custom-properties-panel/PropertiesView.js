import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

class PropertiesView extends PureComponent {

  state = {
    selectedElements: [],
    element: {},
    eventType: '',
    taskType: '',
  }

  componentDidMount() {
    const { bpmnModeler } = this.props;
    // bpmnModeler.on('selection.changed', e => {
    //   const selectedElements = e.newSelection
    //   const element = e.newSelection[0]
    //   console.log(element)
    //   this.setState({ selectedElements });
    //   this.setDefaultProperties(element);
    // })
    // bpmnModeler.on('element.changed', e => {
    //   console.log('changed');
    // })
    bpmnModeler.on('element.click', e => {
      const selectedElements = [e.element]
      const element = selectedElements[0]
      console.log(element)
      this.setState({ selectedElements });
      this.setDefaultProperties(element);
    })
  }

  setDefaultProperties = (el) => {
    const element = el
    if (element) {
      const { type, businessObject } = element
      const { name } = businessObject
      if (this.verifyIsEvent(type)) {
        const eventType = businessObject.eventDefinitions ? businessObject.eventDefinitions[0].$type : ''
        console.log(eventType)
        this.setState({ eventType })
      } else if (this.verifyIsTask(type)) {
        const taskType = type;
        this.setState({ taskType })
      }
      element.name = name || '';
      this.setState({ element });
    }
  };

  verifyIsEvent = (type) => type.includes('Event')

  verifyIsTask = (type) => type.includes('Task')

  changeField = (event, type) => {
    console.log(event)
    console.log(type)
    const element = this.state.element;
    const value = event.target.value
    element[type] = value
    const properties = {}
    properties[type] = value
    this.updateProperties(properties, element)
  }

  /**
    * 更新元素属性
    * @param { Object } 要更新的属性, 例如 { name: '' }
  */
  updateProperties(properties, element) {
    const { bpmnModeler } = this.props;
    const modeling = bpmnModeler.get('modeling')
    modeling.updateProperties(element, properties)
  }

  // updateName(name) {
  //   const { modeler, element } = this
  //   const modeling = modeler.get('modeling')
  //   modeling.updateLabel(element, name)
  // };
  // onChangeColor(color) {
  //   console.log(color)
  //   const { modeler, element } = this
  //   const modeling = this.modeler.get('modeling')
  //   modeling.setColor(element, {
  //     fill: null,
  //     stroke: color
  //   })
  // };
  // changeEventType(event) {
  //   console.log(event)
  //   const { modeler, element } = this
  //   const value = event.target.value
  //   const bpmnReplace = modeler.get('bpmnReplace')
  //   this.eventType = value
  //   bpmnReplace.replaceElement(element, {
  //     type: element.businessObject.$type,
  //     eventDefinitionType: value
  //   })
  // };
  // changeTaskType(event) {
  //   console.log(event)
  //   const { modeler, element } = this
  //   const value = event.target.value
  //   const bpmnReplace = modeler.get('bpmnReplace')
  //   bpmnReplace.replaceElement(element, {
  //     type: value
  //   })
  // };

  render() {
    const { selectedElements, element, eventType, taskType } = this.state;
    console.log('eventType', eventType, ';taskType', taskType);
    return(
      <div>
        {
          selectedElements.length <= 0 && <div>请选择一个元素</div>
        }
        {
          selectedElements.length > 0 && <div>
            <div>
              <p>id:</p>
              <p>{element.id}</p>
            </div>
            <div>
              <p>标题</p>
              <Input defaultValue={element.name} placeholder="标题" onChange={(e) => this.changeField(e, 'name')} />
            </div>
          </div>
        }
      </div>
    )
  }
}

PropertiesView.propTypes = {
  bpmnModeler: PropTypes.object,
};

export default PropertiesView;