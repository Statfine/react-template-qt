/**
 * bpmn 自定义添加拓展面板
 */
import React, { PureComponent } from 'react';
import { Button } from 'antd';
import _ from 'lodash';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css'; // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';

import { PropertiesView } from './custom-properties-panel';

import xmlInit from './utils/init.bpmn';
import StyleUtil from './utils/StyleUtil';
import smartPackage from '../BpmnProvider/source/smart.json'; // 如果要在属性面板中维护smart：XXX属性，则需要此

export default class BpmnCustomExtension extends PureComponent {
  state = {
    moder: {},
  };

  bpmnModeler;

  componentDidMount() {
    this.bpmnModeler = new BpmnModeler({
      container: '#js-canvas',
      moddleExtensions: {
        smart: smartPackage,
      },
    });
    this.setState({ moder: this.bpmnModeler });
    this.initDiagram(xmlInit);
  }

  initDiagram = async xml => {
    try {
      await this.bpmnModeler.importXML(xml);
      StyleUtil.changeArrows();
    } catch (error) {
      console.error(error);
    }
  };

  // 保存
  handleSave = () => {
    this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
      console.log(xml);
    });
  };

  render() {
    const { moder } = this.state;
    return (
      <div style={{ margin: '10px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '-40px' }}>
          <Button onClick={this.handleSave}>保存</Button>
        </div>
        <div
          style={{
            width: '100%',
            height: '400px',
            border: '1px solid #DBECFF',
            overflow: 'scroll',
          }}
          id="js-canvas"
        ></div>
        <div className="smart-content">
          {!_.isEmpty(moder) && <PropertiesView bpmnModeler={moder} />}
        </div>
      </div>
    );
  }
}
