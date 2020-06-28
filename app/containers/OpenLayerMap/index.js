import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Button, Card, Col, Row } from 'antd'; 
import $ from 'jquery';

import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';

import Vector from 'ol/layer/Vector'; // 地图矢量图层 包含一个数据（source）和一个样式（style）；一个初始化成功的矢量图层包含一个到多个要素（feature）
import VectorSource from 'ol/source/Vector';

import * as olProj from 'ol/proj'; // 坐标转换
import TileLayer from 'ol/layer/Tile'; // 图层
import XYZSource from 'ol/source/XYZ'; // 可以加载Tile瓦片图
// import OSM from 'ol/source/OSM';

import { Icon, Style, Fill, Stroke, Circle, Text } from 'ol/style'; // 样式
import Feature from 'ol/Feature'; //  feature（要素），即地图上的几何对象geometry ↓
import { Point, LineString, Polygon } from 'ol/geom';  // ↑ 包括点（Point），线（LineString）,多边形（Polygon），圆（Circle） 区别在于Polygon和LineString一个会连接第一和最后一个点, 一个不会. LineString 二维数组   Polygon三位数组

import GeoJSON from 'ol/format/GeoJSON';

import './style.css';
import RoadJson from './data/huangqiangbeiToHuaxinDriving.json'; // 路径json
import AreaJson from './data/shenzhen.json';

import coordinatePng from './img/coordinate.png';
import coordinateStartPng from './img/coordinate-start.png';
import coordinateEndPng from './img/coordinate-end.png';

const Btn = styled(Button)`
  display: block;
  margin: 10px;
`;

export default class OpenLayerMap extends PureComponent {

  state = {
    pointList: []
  }

  componentDidMount() {
    this.init();
  }

  map; // 地图对象

  view; // 视图对象

  menuOverlay; // 右键

  popupEl; // 标注浮层

  mapLayer = []; // layer层用作清除

  areaLayer = []; // 区域遮罩

  // 114.085947,22.547 深圳市
  init = () => {
    const projection = olProj.get("EPSG:3857");
    const navlayer = new TileLayer({
      source: new XYZSource({  
        url:'http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8' // 7,8
        // url:'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}' // 7,8
      }),  
      // source: new OSM(),
      projection 
    });
    this.view = new View({
      center: olProj.transform([114.085947,22.547], 'EPSG:4326', 'EPSG:3857'), // 数据存储在EPSG：4326([106.51, 29.55])中并显示在 EPSG：3857([12958752, 4848452])中
      zoom: 10,
      minZoom: 3
    });
    this.map = new Map({
      target: 'map',
      layers: [navlayer],
      view: this.view,
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

    // this.map.on('pointermove',(e) => {
    //   const pixel=this.map.getEventPixel(e.originalEvent);
    //   const feature=this.map.forEachFeatureAtPixel(pixel, (f) => f);
    //   if(feature === undefined){
    //     this.map.getTargetElement().style.cursor="auto"
    //   }else{
    //     console.log('feature', feature);
    //     this.map.getTargetElement().style.cursor="move"
    //   }
    // })
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
    const vector = new Vector({ // 新建矢量图层
      layerName: 'point',
      source: new VectorSource()
    });
    const feature = new Feature({ // 新建要素
      // 坐标转换 默认3857
      geometry: new Point(olProj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'))
    });
    const iconStyle = new Style({ // 设置样式
      image: new Icon(({
        anchor: [0.5, 180],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: coordinatePng,
        scale: 0.15,
        // offsetOrigin:'top-left',
        // src: 'http://openlayers.org/en/latest/examples/data/icon.png',
      }))
    });
    feature.setId(`${lng},${lat}`); // 要素设置id用作标识
    feature.setStyle(iconStyle); // 要素设置样式
    
    vector.getSource().addFeature(feature); // 讲要素添加到图层
    this.map.addLayer(vector);

    this.handleMapLayer(vector);
  }

  // 连线
  handleAddLine = (coordinates) => {
    // 声明一个新的数组
    const coordinatesPolygon = [];
    // 循环遍历将经纬度转到"EPSG:4326"投影坐标系下, 获取转换后的数组
    for (let i = 0; i < coordinates.length; i += 1) {
      const pointTransform = olProj.transform([coordinates[i][0], coordinates[i][1]], 'EPSG:4326', 'EPSG:3857');
      console.log("开始转换坐标", coordinates[i], pointTransform);
      coordinatesPolygon.push(pointTransform);
    }
    const vectorSource = new VectorSource();
    // 矢量图层
    const vectorLine = new Vector({
      source: vectorSource,
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
    
    const plygon = new LineString(coordinatesPolygon)  // LineString 二维数组   Polygon三位数组
    // // 多边形要素类
    // const plygon = new Polygon([coordinatesPolygon]) // 设置
    const feature = new Feature({
      type: 'route',
      geometry: plygon,
    });
    // const feature = new Feature(new Polygon([coordinatesPolygon])); // 同上两段
    vectorSource.addFeature(feature); // 同理vectorLine.getSource().addFeature(feature); 
    this.map.addLayer(vectorLine);

    this.handleMapLayer(vectorLine)
  }

  // 清空Layer
  handleClearOverLays = () => {
    this.view.setZoom(10);
    this.view.setCenter(olProj.transform([114.085947,22.547], 'EPSG:4326', 'EPSG:3857'));
    this.popupEl.setPosition();
    this.mapLayer.map((item) => this.map.removeLayer(item));
    this.handleMapLayer([], true);
  }

  handleMapLayer = (layer, remove = false) => {
    if (remove) {
      this.mapLayer = [];
      this.setState({ pointList: [] })
    }
    else this.mapLayer.push(layer);
  }

  // 路线设置 result 高德json数据
  handleRoad = (result) => {
    this.view.setZoom(16);
    this.view.setCenter(olProj.transform([114.085947,22.547], 'EPSG:4326', 'EPSG:3857'));
    console.log(result);
    const startC = olProj.transform([result.start.location.lng, result.start.location.lat], "EPSG:4326", "EPSG:3857");
    const endC = olProj.transform([result.end.location.lng, result.end.location.lat], "EPSG:4326", "EPSG:3857");
    const startF = new Feature({ geometry: new Point(startC) });
    startF.name = "起点" || result.start.name;
    const endF = new Feature({ geometry: new Point(endC) });
    endF.name = "终点" || result.end.name;
    const features = [startF, endF];
    // const features = []; // 方法二
    const {routes} = result;
    for(let i=0; i<routes.length; i += 1){
      const eachRoute = routes[i];
      const { steps } = eachRoute;
      for(let j=0; j<steps.length; j += 1){
        const eachStep = steps[j];
        const { tmcsPaths } = eachStep;
        for(let m = 0; m<tmcsPaths.length; m += 1){
          const coord = [];
          const { path } = tmcsPaths[m];
          for(let k=0; k<path.length; k += 1){
            const eachPath = path[k];
            const point = olProj.transform([eachPath.lng, eachPath.lat], "EPSG:4326", "EPSG:3857");
            coord.push(point)
            // features.push(point) // 方法二
          }
          const pathF = new Feature(new LineString(coord));
          pathF.status = tmcsPaths[m].status;
          features.push(pathF);
        }
      }
    }

    // 方法二
    // const geometry = new LineString(features);
    // const LineStringFeature = new Feature(geometry); // 绘制线的数据
    // // 将线添加到Vector绘制层上
    // const vectorSource = new VectorSource();
    // vectorSource.addFeature(LineStringFeature);

    const vectorSource = new VectorSource({
      features,
    });
    const vector = new Vector({
      source: vectorSource,
      style: (feature) => {
        const name = feature.name ? "" : "";
        // const { status } = feature;

        // let pointerColor = "#8f8f8f";
        // if(name === "起") pointerColor = "#3b8424";
        // else if(name === "终") pointerColor = "#eb3223";

        // let strokeColor = "#8f8f8f";
        // if(status==="拥堵") strokeColor="#e20000";
        // else if(status==="缓行") strokeColor="#ff7324";
        // else if(status==="畅通") strokeColor="#00b514";

        return new Style({
          // image: new Circle({
          //   radius: 15,
          //   fill: new Fill({
          //     color: pointerColor,
          //   })
          // }),
          image: new Icon(({
            anchor: [0.5, 180],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: feature.name === '终点' ? coordinateEndPng : coordinateStartPng,
            scale: 0.18,
          })),
          stroke: new Stroke({
            color: "#ff7324",
            width: 5,
            // lineDash:[10, 8]
          }),
          text: new Text({
            text: name,
            font:"bold 15px 微软雅黑",
            fill: new Fill({
              color: 'white'
            }),
            textAlign:"center",
            textBaseline:"middle"
          })
        })
      }
    });
    this.map.addLayer(vector);
    this.handleMapLayer(vector)
  }

  // 遮罩
  handleAreaShade = () => {
    const geojsonObject = AreaJson; // geojson数据
    const vectorSource = new VectorSource({
      features: (new GeoJSON({featureProjection: 'EPSG:3857'})).readFeatures(geojsonObject),
      // 将EPSG:4326坐标系修改为EPSG:3857
    });
    
    const vectorLayer = new Vector({
      source: vectorSource,
      style: this.handleGetAreStyle
    });
    this.map.addLayer(vectorLayer);

    this.areaLayer.push(vectorLayer);
  }

  //  设置遮罩层的样式
  handleGetAreStyle = (feature) => {
    const fillColorList = [
      'rgba(255, 255, 0, 0.5)',
      'rgba(137, 228, 232, 0.5)',
      'rgba(137, 228, 232, 0.5)',
      'rgba(200, 232, 137, 0.5)',
      'rgba(232, 199, 137, 0.5)',
      'rgba(232, 137, 194, 0.5)',
      'rgba(181, 80, 222, 0.5)',
      'rgba(37, 140, 179, 0.5)',
      'rgba(210, 195, 22, 0.5)',
      'rgba(161, 51, 218, 0.5)',
    ]
    const image = new Circle({
      radius: 5,
      fill: null,
      stroke: new Stroke({color: 'red', width: 1})
    });
    let area = feature.getProperties().name;
    area = area || '';
    let style;

    let fillColor = fillColorList[0]
    if (area === '罗湖区') fillColor = fillColorList[1];
    if (area === '福田区') fillColor = fillColorList[2];
    if (area === '南山区') fillColor = fillColorList[3];
    if (area === '宝安区') fillColor = fillColorList[4];
    if (area === '龙岗区') fillColor = fillColorList[5];
    if (area === '盐田区') fillColor = fillColorList[6];
    if (area === '龙华区') fillColor = fillColorList[7];
    if (area === '光明区') fillColor = fillColorList[8];

    switch (feature.getGeometry().getType()) {
      case "MultiPoint":
      case "Point":
        style = new Style({ image });
        break;
      case "LineString":
        style = new Style({
          stroke: new Stroke({
            color: 'green',
            width: 1
          })
        })
        break;
      case "MultiLineString":
        style = new Style({
          stroke: new Stroke({
            color: 'green',
            width: 1
          })
        })
        break;
      case "MultiPolygon":
        style = new Style({
          image: new Circle({
            radius: 15,
            fill: new Fill({
              color: "#8f8f8f",
            })
          }),
          stroke: new Stroke({
            color: "#4885eb",
            width: 2,
            // lineDash:[10, 8]
          }),
          fill: new Fill({
            color: fillColor,
          }),
          text: new Text({
            text: area,
            font:"bold 18px 微软雅黑",
            fill: new Fill({
              color: '#eb3223'
            }),
            textAlign:"center",
            textBaseline:"middle"
          }),
        });
        break;
      case "Polygon":
        style = new Style({
          stroke: new Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.5)'
          })
        });
        break;
      case "GeometryCollection":
        style = new Style({
          stroke: new Stroke({
            color: 'magenta',
            width: 2
          }),
          fill: new Fill({
            color: 'magenta'
          }),
          image: new Circle({
            radius: 10,
            fill: null,
            stroke: new Stroke({
              color: 'magenta'
            })
          })
        });
        break;
      case "Circle":
        style = new Style({
          stroke: new Stroke({
            color: 'red',
            width: 2
          }),
          fill: new Fill({
            color: 'rgba(255,0,0,0.2)'
          })
        });
        break;
      default:
        break;
    }
    return style;
  }

  handleArea = (coordinates, name, fillColor) => {
    // const coordinates = AreaJson.features[0].geometry.coordinates[0][0];
    const coordinatesPolygon = [];
    for (let i = 0; i < coordinates.length; i += 1) {
      const pointTransform = olProj.transform([coordinates[i][0], coordinates[i][1]], 'EPSG:4326', 'EPSG:3857');
      coordinatesPolygon.push(pointTransform);
    }
    const polygonFeature = new Feature({
      type: 'polygon',
      geometry: new Polygon([coordinatesPolygon])
    });  
    polygonFeature.setStyle(new Style({
      stroke: new Stroke({
        width: 2,
        color: "#4885eb"
      }),
      fill: new Fill({
        color: fillColor
      }),
      text: new Text({
        text: name
      })
    }))
    const polygonLayer = new Vector({
      source: new VectorSource({
        features: [polygonFeature]
      }),
    })
    this.map.addLayer(polygonLayer)
    this.areaLayer.push(polygonLayer);
  }

  handleAddShenZhenArea = () => {
    this.handleClearArea();
    // 设置区域
    this.handleAreaShade();
  }

  handleAddPartArea = () => {
    this.handleClearArea();
    // 设置区域
    this.handleArea(AreaJson.features[0].geometry.coordinates[0][0], AreaJson.features[0].properties.name, 'rgba(137, 228, 232, 0.5)');
    this.handleArea(AreaJson.features[8].geometry.coordinates[0][0], AreaJson.features[8].properties.name, 'rgba(181, 80, 222, 0.5)');
  }

  handleClearArea = () => {
    this.areaLayer.map((item) => this.map.removeLayer(item))
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
        <Row gutter={16}>
          <Col span={8}>
            <Card title="区域设置" style={{ width: 300 }}>
              <Btn type="primary" onClick={this.handleClearOverLays}>清空路线和组标点</Btn>
              <Btn type="primary" onClick={() => this.handleRoad(RoadJson)}>添加路线</Btn>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="区域设置" style={{ width: 300 }}>
              <Btn type="primary" onClick={this.handleAddShenZhenArea}>深圳区域</Btn>
              <Btn type="primary" onClick={this.handleAddPartArea}>部分区域</Btn>
              <Btn type="primary" onClick={this.handleClearArea}>清空区域</Btn>
            </Card>
          </Col>
          <Col span={8}></Col>
        </Row>
      </>
    )
  }
}