import React, { PureComponent } from 'react';

import { Button, Card, Col, Row } from 'antd';

import 'ol/ol.css';
import * as olProj from 'ol/proj'; // 坐标转换
import TileLayer from 'ol/layer/Tile'; // 图层
import XYZSource from 'ol/source/XYZ'; // 可以加载Tile瓦片图
import { Map, View, Overlay } from 'ol';

import './style.css';
import { injectMap, setViewZoom, addMark, drawLine, drawRoadByGaoDeJson, drawRoadByCoordinates, drawAreaShadeByJson, drawAreaShadeByCoordinates } from './mapUtility';

import coordinatePng from './img/coordinate.png';
import RoadGaoDeJson from './data/huangqiangbeiToHuaxinDriving.json'; // 路径json
import RoadMoveJson from './data/move.json'; // 路径json
import ShenZhenAreaJson from './data/shenzhen.json';

function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); // eslint-disable-line
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4()); // eslint-disable-line
}

export default class DefaultOpenLayer extends PureComponent {
  state = {
    elementId: 'map', // 元素ID
    centerPoniter: [114.085947, 22.547], // 初始中心点（114.085947,22.547-深圳坐标）
    drawLineFlag: false,
  };

  componentDidMount() {
    const { elementId, centerPoniter } = this.state;
    this.initMap(elementId, centerPoniter);
  }

  map; // 地图对象-用作添加layer

  view; // 视图对象，调整中心点

  menuEl; // 右键浮层

  popupEl; // 标记浮层

  layerList = { // 动态添加的层级
    mark: {},
    line: {},
    area: {},
    road: {},
  };

  /**
   * 初始化地图
   *
   *  olProj 设置坐标系
   *  TileLayer 图层-高德地图
   */
  initMap = (elementId, centerPoniter) => {
    const projection = olProj.get('EPSG:3857');
    const navlayer = new TileLayer({
      source: new XYZSource({
        url:
          'http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8', // 7,8
      }),
      projection,
    });
    this.view = new View({
      center: olProj.transform(centerPoniter, 'EPSG:4326', 'EPSG:3857'), // 数据存储在EPSG：4326([106.51, 29.55])中并显示在 EPSG：3857([12958752, 4848452])中
      zoom: 13,
      minZoom: 3,
      // extent: olProj.transform([minx, miny, maxx, maxy], 'EPSG:4326', 'EPSG:3857') // 地图范围设置；如何和中心坐标一样则表示不能拖动
    });
    this.map = new Map({
      target: elementId,
      layers: [navlayer],
      view: this.view,
    });
    injectMap(this.map, this.view); // 工具方法注入map对象

    // 右键弹框设置
    this.menuOverlay = new Overlay({
      element: document.getElementById('contextmenu_container'),
      positioning: 'top-left',
    });
    this.menuOverlay.setMap(this.map);

    // 标记设置弹框
    const container = document.getElementById('popup');
    const popupCloser = document.getElementById('popup-closer');
    this.popupEl = new Overlay({
      element: container,
      autoPan: true,
    });
    this.map.addOverlay(this.popupEl);
    popupCloser.addEventListener('click', () => {
      this.popupEl.setPosition(undefined);
    });

    // 事件添加
    // this.handleAddClickEvent();
    // this.handleAddMenuEvent();
  };

  // 添加点击事件
  handleAddClickEvent = () => {
    this.map.on('singleclick', this.handleClickMap); // click
  };

  // 地图点击事件
  handleClickMap = e => {
    const pixel = this.map.getEventPixel(e.originalEvent);
    const { coordinate } = e; // 获取到的为默认3857
    const clickPosition = olProj.transform(
      coordinate,
      'EPSG:3857',
      'EPSG:4326',
    );
    const featureMap = this.map.forEachFeatureAtPixel(pixel, f => f);
    // 判断有无覆盖物
    if (featureMap) {
      // 可以通过id判断是哪个
      if (this.popupEl.getPosition()) this.popupEl.setPosition();
      else this.popupEl.setPosition(coordinate);
    } else {
      this.popupEl.setPosition();
      const id = guid();
      addMark([clickPosition[0], clickPosition[1]], id, coordinatePng, layer => {
        this.layerList.mark[id] = layer;
      });
      if (this.state.drawLineFlag) {
        const roadId = guid();
        drawLine([this.state.centerPoniter, clickPosition], roadId, layer => {
          this.layerList.line[id] = layer;
        });
      }
    }
    this.menuOverlay.setPosition(undefined);
  };

  // 添加右键事件
  handleAddMenuEvent = () => {
    this.map.on('contextmenu', this.handleClickMenu);
  };

  // 鼠标右键事件
  handleClickMenu = event => {
    event.preventDefault(); // 屏蔽自带的右键事件
    const pixel = [event.clientX, event.clientY];
    const feature = this.map.forEachFeatureAtPixel(pixel, f => f);
    if (!feature) {
      const coordinate = this.map.getEventCoordinate(event.originalEvent);
      this.menuOverlay.setPosition(coordinate);
    }
  };

  // 中心点设置
  handleSetZoom = () => {
    setViewZoom(this.state.centerPoniter, 16);
  }

  // 添加线
  handleDrawLine = () => {
    const { drawLineFlag } = this.state;
    this.setState({ drawLineFlag: !drawLineFlag });
  };

  // 添加路线
  handleDrawRoad = () => {
    const id = guid();
    drawRoadByGaoDeJson(RoadGaoDeJson, id, layer => {
      this.layerList.road[id] = layer;
    });
  };

  // 添加路线
  handleDrawRoadCoordinates = () => {
    const id = guid();
    drawRoadByCoordinates(RoadMoveJson, id, layer => {
      this.layerList.road[id] = layer;
    });
  };

  // json区域遮罩
  handleDrawArea = () => {
    const id = guid();
    drawAreaShadeByJson(ShenZhenAreaJson, id, layer => {
      this.layerList.area[id] = layer;
    });
  }

  // 单个区域遮罩
  handleDrawAreaByCoordinates = () => {
    const id = guid();
    drawAreaShadeByCoordinates(ShenZhenAreaJson.features[0].geometry.coordinates[0][0], ShenZhenAreaJson.features[0].properties.name, 'rgba(137, 228, 232, 0.5)', id, layer => {
      this.layerList.area[id] = layer;
    });
  }

  /**
   * 清理layer层
   * flag  0-全部；1-mark；2-line；3-area； 4-road
   */
  handleClear = (flag) => {
    if (flag === 1 || flag === 0) {
      for (const k in this.layerList.mark) {
        this.map.removeLayer(this.layerList.mark[k]);
      }
    }
    if (flag === 2 || flag === 0) {
      for (const k in this.layerList.line) {
        this.map.removeLayer(this.layerList.line[k]);
      }
    }
    if (flag === 3 || flag === 0) {
      for (const k in this.layerList.area) {
        this.map.removeLayer(this.layerList.area[k]);
      }
    }
    if (flag === 4 || flag === 0) {
      for (const k in this.layerList.road) {
        this.map.removeLayer(this.layerList.road[k]);
      }
    }
  };

  // 右键浮层
  renderMenu = () => (
    <div id="contextmenu_container" className="contextmenu">
      <ul>
        <li>操作1</li>
        <span className="menuLine"></span>
        <li>操作2</li>
      </ul>
    </div>
  );

  // 标记浮层
  renderMarkPopup = () => (
    <div id="popup" className="ol-popup">
      <div id="popup-closer" className="ol-popup-closer" />
      <div id="popup-content">内容区域</div>
    </div>
  );

  render() {
    const { elementId } = this.state;
    return (
      <>
        <div style={{ width: '800px', height: '400px' }} id={elementId}>
          {this.renderMenu()}
        </div>
        {this.renderMarkPopup()}
        <Row gutter={16}>
          <Col span={8}>
            <Card title="区域设置" style={{ width: 300 }}>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={this.handleSetZoom}>
                中心点设置
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={this.handleAddClickEvent}>
                添加点击事件
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={this.handleAddMenuEvent}>
                添加鼠标右键事件
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={this.handleDrawRoad}>
                高德数据路线
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={this.handleDrawRoadCoordinates}>
                动态坐标路线
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={this.handleDrawArea}>
                深圳区域
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={this.handleDrawAreaByCoordinates}>
                罗湖区域
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={this.handleDrawLine}>
                {this.state.drawLineFlag ? '关闭连线' : '开启连线'}
              </Button>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="清空操作" style={{ width: 300 }}>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={() => this.handleClear(1)}>
                清空标点
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={() => this.handleClear(2)}>
                清空连线
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={() => this.handleClear(3)}>
                清空区域
              </Button>
              <Button style={{ margin: '10px', display: 'block' }} type="primary" onClick={() => this.handleClear(4)}>
                清空路线
              </Button>
            </Card>
          </Col>
          <Col span={8}></Col>
        </Row>
      </>
    );
  }
}
