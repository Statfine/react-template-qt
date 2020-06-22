import React, { PureComponent } from 'react';
import { Button } from 'antd'; 
import $ from 'jquery';

import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';

import Vector from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import PointGeom from 'ol/geom/Point';

import * as olProj from 'ol/proj'; // 坐标转换
import TileLayer from 'ol/layer/Tile'; // 图层
import XYZSource from 'ol/source/XYZ'; // 可以加载Tile瓦片图

import { Icon, Style, Fill, Stroke, Circle } from 'ol/style'; // 样式
import Feature from 'ol/Feature'; //  feature（要素），即地图上的几何对象，包括点（Point），线（LineString）,多边形（Polygon），圆（Circle），通过 ol.interaction.Drew 绘制

import Polygon from 'ol/geom/Polygon';

import './style.css';

export default class OpenLayerMap extends PureComponent {

  state = {
    pointList: []
  }

  componentDidMount() {
    this.init();
  }

  map; // 地图对象

  menuOverlay; // 右键

  popupEl; // 标注浮层

  mapLayer = []; // layer层用作清除

  // 114.085947,22.547 深圳市
  init = () => {
    const projection = olProj.get("EPSG:3857");
    const navlayer = new TileLayer({
      source: new XYZSource({  
        url:'http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8' // 7,8
      }),  
      projection 
    });
    this.map = new Map({
      target: 'map',
      layers: [navlayer],
      view: new View({
        center: olProj.transform([114.085947,22.547], 'EPSG:4326', 'EPSG:3857'), // 数据存储在EPSG：4326([106.51, 29.55])中并显示在 EPSG：3857([12958752, 4848452])中
        zoom: 16,
        minZoom: 3
      })
    });

    // 添加点击事件
    this.map.on('click', this.handleClickMap);

    // 右键弹框设置
    this.menuOverlay = new Overlay({
      element: document.getElementById("contextmenu_container"),
      positioning: 'top-left'
    });
    this.menuOverlay.setMap(this.map);
    $(this.map.getViewport()).on("contextmenu", (event) => {
      event.preventDefault(); // 屏蔽自带的右键事件
      const pixel = [event.clientX,event.clientY];
      const feature = this.map.forEachFeatureAtPixel(pixel,(f) => f)
      if(!feature){
        const coordinate = this.map.getEventCoordinate(event.originalEvent);
        this.menuOverlay.setPosition(coordinate);
      }
    });

    // 标记设置弹框
    const container = document.getElementById("popup");
    // const content = document.getElementById("popup-content");
    const popupCloser = document.getElementById("popup-closer");
    this.popupEl = new Overlay({
      element: container,
      // positioning: 'bottom-center',
      // stopEvent: false,
      // offset: [0, 50],
      autoPan: true
    });
    this.map.addOverlay(this.popupEl);
    popupCloser.addEventListener('click',() => {
      this.popupEl.setPosition(undefined);
    });
  }

  // 地图点击事件
  handleClickMap = (e) => {
    const pixel = this.map.getEventPixel(e.originalEvent);
    const {coordinate} = e; // 获取到的为默认3857
    const clickPosition = olProj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    console.log('pixel', pixel, coordinate, clickPosition);
    const featureMap = this.map.forEachFeatureAtPixel(pixel, (f) => f);
    // 判断有无覆盖物
    console.log("点击了覆盖物", featureMap) 
    if (featureMap) {
      // 可以通过id判断是哪个
      if (this.popupEl.getPosition()) this.popupEl.setPosition();
      else this.popupEl.setPosition(coordinate);
    } else {
      this.popupEl.setPosition();
      this.handleAddPoint(clickPosition[0], clickPosition[1]);
      const { pointList } = this.state;
      const list = pointList.concat([clickPosition])
      this.setState({ pointList: list })
      if (list.length >= 2) {
        this.handleAddLine([list[0], list[list.length - 1]])
      }
    }
    this.menuOverlay.setPosition(undefined);
  }

  // 添加坐标点
  handleAddPoint = (lng, lat) => {
    const vector = new Vector({
      layerName: 'point',
      source: new VectorSource()
    });
    const iconStyle = new Style({
      image: new Icon(({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'http://openlayers.org/en/latest/examples/data/icon.png'
      }))
    });
    const feature = new Feature({
      // 坐标转换 默认3857
      geometry: new PointGeom(olProj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'))
    });
    feature.setId(`${lng},${lat}`); // 设置id用作标识

    feature.setStyle(iconStyle);
    
    vector.getSource().addFeature(feature);
    this.handleMapLayer(vector)
    this.map.addLayer(vector);
  }

  // 连线
  handleAddLine = (coordinates) => {
    // 声明一个新的数组
    const coordinatesPolygon = [];
    // 循环遍历将经纬度转到"EPSG:4326"投影坐标系下
    for (let i = 0; i < coordinates.length; i += 1) {
      console.log("开始转换坐标");
      const pointTransform = olProj.transform([coordinates[i][0], coordinates[i][1]], 'EPSG:4326', 'EPSG:3857');
      coordinatesPolygon.push(pointTransform);
    }
    const source = new VectorSource();
    // 矢量图层
    const vectorLine = new Vector({
      source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.1)'
        }),
        stroke: new Stroke({
          color: 'red',
          width: 2
        }),
        image: new Circle({
          radius: 2,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    });
    const plygon = new Polygon([coordinatesPolygon])
    // 多边形要素类
    const feature = new Feature({
      geometry: plygon,
    });
    source.addFeature(feature);
    this.handleMapLayer(vectorLine)
    this.map.addLayer(vectorLine);
  }

  // 清空Layer
  handleClearOverLays = () => {
    this.mapLayer.map((item) => this.map.removeLayer(item))
    this.handleMapLayer([], true);
  }

  handleMapLayer = (layer, remove = false) => {
    if (remove) {
      this.mapLayer = [];
      this.setState({ pointList: [] })
    }
    else this.mapLayer.push(layer);
  }

  render() {
    return (
      <>
        <div style={{ width: '800px', height: '400px' }} id="map">
          <div id="contextmenu_container" className="contextmenu">
            <ul>
              <li>操作1</li>
              <span className="menuLine"></span>
              <li>操作2</li>
            </ul>
          </div>
        </div>
        <div id="popup" className="ol-popup">
          <div id="popup-closer" className="ol-popup-closer" />
          <div id="popup-content">内容区域</div>
        </div>
        <Button type="primary" onClick={this.handleClearOverLays}>清空图层</Button>
      </>
    )
  }
}