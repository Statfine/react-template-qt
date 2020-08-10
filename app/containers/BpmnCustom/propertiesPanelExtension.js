/**
 * bpmn 自定义添加拓展面板
*/
import React, { PureComponent } from 'react';
import { Button } from 'antd';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';   // 这里引入的是右侧属性栏这个框
import 'bpmn-js/dist/assets/diagram-js.css' // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';

import propertiesProviderModule from '../BpmnProvider/workflow/properties-panel/provider/smart'; // 而这个引入的是右侧属性栏里的内容
import propertiesProviderAuthModule from './properties-panel-extension/provider/authority'; // 而这个引入的是右侧属性栏里的内容
import smartPackage from '../BpmnProvider/source/smart.json';  // 如果要在属性面板中维护smart：XXX属性，则需要此 
import customTranslate from '../BpmnProvider/workflow/customTranslate/customTranslate';

import xmlInit from '../Bpmn/init.bpmn';
import StyleUtil from '../Bpmn/utils/StyleUtil';

export default class BpmnCustomExtension extends PureComponent {

  bpmnModeler;

  componentDidMount() {
    const customTranslateModule = {
      translate: [ 'value', customTranslate ]
    };

    this.bpmnModeler = new BpmnModeler({
      container: '#js-canvas',
      propertiesPanel: {
        parent: '#js-properties-panel'
      },
      additionalModules: [
        propertiesPanelModule, // 右侧工具栏
        propertiesProviderModule, // smart
        propertiesProviderAuthModule, // custom auth
        customTranslateModule,
      ],
      moddleExtensions: {
        smart: smartPackage,
      }
    });
    this.initDiagram(xmlInit);
  }

  initDiagram = async (xml) => {
    try {
      await this.bpmnModeler.importXML(xml);
      StyleUtil.changeArrows();
    } catch (error) {
      console.error(error);
    }
  };

  // 保存
  handleSave = () => {
    this.bpmnModeler.saveXML({format: true}, (err, xml) => {
      console.log(xml);
    });
  };

  render() {
    return(
      <div style={{ margin: '10px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '-40px' }}>
          <Button  onClick={this.handleSave}>保存</Button>
        </div>
        <div style={{ width: '100%', height: '400px', border: '1px solid #DBECFF', overflow: 'scroll' }} id="js-canvas">
        </div>
        <div className="smart-content" id="js-properties-panel"></div>
      </div>
    )
  }

}