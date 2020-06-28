/* eslint-disable no-underscore-dangle */
import React, { PureComponent } from 'react';

import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { Map, View, Feature } from 'ol';
import { Style, Icon, Stroke, Circle } from 'ol/style';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import { Point, LineString, Polygon } from 'ol/geom';
import * as olProj from 'ol/proj'; // 坐标转换

const coordinates1 = [
  [112.87197876066057, 28.22084712811648],
  [112.8720016491825, 28.225383281160706],
  [112.87314605792562, 28.228450298111515],
  [112.87527465926178, 28.23101377452122],
  [112.87994384801641, 28.232203960351857],
  [112.88353729301525, 28.23128843224413],
  [112.8825531017319, 28.225932597479645],
];
export default class OpenLayerTestMap extends PureComponent {
  componentDidMount() {
    this.init();
  }

  coordinate2 = [
    [112.87197876066057, 28.22084712811648],
    [112.8720016491825, 28.225383281160706],
    [112.87314605792562, 28.228450298111515],
    [112.87527465926178, 28.23101377452122],
    [112.87994384801641, 28.232203960351857],
    [112.88353729301525, 28.23128843224413],
    [112.8825531017319, 28.225932597479645],
  ];

  init = () => {
    const projection = olProj.get('EPSG:3857');
    const navlayer = new TileLayer({
      source: new XYZ({
        url:
          'http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8', // 7,8
        // url:'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}' // 7,8
      }),
      // source: new OSM(),
      projection,
    });
    this.view = new View({
      center: olProj.transform([112.87, 28.23], 'EPSG:4326', 'EPSG:3857'), // 数据存储在EPSG：4326([106.51, 29.55])中并显示在 EPSG：3857([12958752, 4848452])中
      zoom: 13,
      minZoom: 3,
    });
    this.map = new Map({
      target: 'map',
      layers: [navlayer],
      view: this.view,
    });
    // this.handleAddBatchFeature();
    // this.addLine();
    // this.addPolygon();
    this.renderSport();
  };

  // const coordinates = [];
  // for (let i = 0; i < coordinates1.length; i += 1) {
  //   const pointTransform = olProj.transform([coordinates1[i][0], coordinates1[i][1]], 'EPSG:4326', 'EPSG:3857');
  //   coordinates.push(pointTransform);
  // }

  handleAddBatchFeature = () => {
    // 设置图层
    const flagLayer = new VectorLayer({
      source: new VectorSource(),
    });
    // 添加图层
    this.map.addLayer(flagLayer);
    const features = [];
    // 循环添加feature
    for (let i = 0; i < coordinates1.length; i += 1) {
      const pointTransform = olProj.transform(
        [coordinates1[i][0], coordinates1[i][1]],
        'EPSG:4326',
        'EPSG:3857',
      );
      // 创建feature
      const feature = new Feature({
        geometry: new Point([pointTransform[0], pointTransform[1]]),
      });
      // 设置ID
      feature.setId(i);
      // 设置样式
      feature.setStyle(this.getStyls(feature));
      // 放入features
      features.push(feature);
    } // for 结束
    // 批量添加feature
    flagLayer.getSource().addFeatures(features);
  };

  /**
   * 设置Style
   */
  getStyls = feature => {
    const Styles = [];
    // 绘制圆角矩形
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const length = `${feature.id_}标记点`.length + 2;
    canvas.width = length * 15;
    canvas.height = 35;
    const x = 0;
    const y = 0;
    const w = canvas.width;
    const h = canvas.height;
    const r = 15;
    // 缩放
    context.scale(0.8, 0.8);
    context.fillStyle = 'rgba(255,255,255,1)';
    // 绘制圆角矩形
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    // 设置阴影
    context.shadowColor = 'rgba(0, 0, 0, 0.2)'; // 颜色
    context.shadowBlur = 5; // 模糊尺寸
    context.shadowOffsetX = 2; // 阴影Y轴偏移
    context.shadowOffsetY = 2; // 阴影X轴偏移
    // ----
    context.closePath();
    // 填充
    context.fill();
    // 设置style
    Styles.push(
      new Style({
        image: new Icon({
          img: canvas,
          imgSize: [w, h],
          anchor: [0, 1],
        }),
        text: new Text({
          textAlign: 'center',
          text: `标记点${feature.id_}`,
          offsetX: 35,
          offsetY: -18,
        }),
        zIndex: feature.id_,
      }),
    );
    Styles.push(
      new Style({
        image: new Icon({
          src: 'http://weilin.me/ol3-primer/img/anchor.png',
          anchor: [0.5, 1],
        }),
        zIndex: feature.id_,
      }),
    );
    return Styles;
  };

  /**
   * 设置线路
   */
  addLine = () => {
    const coordinates = [];
    for (let i = 0; i < coordinates1.length; i += 1) {
      const pointTransform = olProj.transform(
        [coordinates1[i][0], coordinates1[i][1]],
        'EPSG:4326',
        'EPSG:3857',
      );
      coordinates.push(pointTransform);
    }
    const routeFeature = new Feature({
      type: 'route',
      geometry: new LineString(coordinates),
    });
    // 设置图层
    const routeLayer = new VectorLayer({
      source: new VectorSource({
        features: [routeFeature],
      }),
      style: this.styleFunction
    });
    // 添加图层
    this.map.addLayer(routeLayer);
  };

  // https://openlayers.org/en/latest/examples/data/arrow.png
  styleFunction = feature => {
    const geometry = feature.getGeometry();
    const styles = [
      // linestring
      new Style({
        stroke: new Stroke({
          color: [255, 0, 0, 0.5],
          width: 4,
        }),
      }),
    ];
    geometry.forEachSegment((start, end) => {
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const rotation = Math.atan2(dy, dx);
      styles.push(
        new Style({
          geometry: new Point(end),
          image: new Icon({
            src: 'https://openlayers.org/en/latest/examples/data/arrow.png',
            rotateWithView: false,
            rotation: -rotation,
            scale: 0.5,
          }),
        }),
      );
    });
    return styles;
  };

  addPolygon = () => {
    const coordinates = [];
    for (let i = 0; i < coordinates1.length; i += 1) {
      const pointTransform = olProj.transform(
        [coordinates1[i][0], coordinates1[i][1]],
        'EPSG:4326',
        'EPSG:3857',
      );
      coordinates.push(pointTransform);
    }
    const polygonFeature = new Feature({
      type: 'polygon',
      geometry: new Polygon([coordinates]),
    });
    polygonFeature.setStyle(
      new Style({
        stroke: new Stroke({
          width: 5,
          color: [255, 255, 0, 0.8],
        }),
        fill: new Fill({
          color: [248, 172, 166, 0.6],
        }),
        text: new Text({
          text: '这是区域',
        }),
      }),
    );
    const polygonLayer = new VectorLayer({
      source: new VectorSource({
        features: [polygonFeature],
      }),
    });
    this.map.addLayer(polygonLayer);
  };

  renderSport = () => {
    // 实例一个数据源获取feature
    // 实例化一个矢量图层Vector作为绘制层
    const source = new VectorSource();
    // 实例一个线(标记点)的全局变量
    const coordinates = []; // 线,Point 点,Polygon 线
    // for (let i = 0; i < this.coordinate2.length; i += 1) {
    //   const pointTransform = olProj.transform(
    //     [this.coordinate2[i][0], this.coordinate2[i][1]],
    //     'EPSG:4326',
    //     'EPSG:3857',
    //   );
    //   coordinates.push(pointTransform);
    // }
    const geometry = new LineString(coordinates);

    const LineStringFeature = new Feature(geometry); // 绘制线的数据
    // 将线添加到Vector绘制层上
    source.addFeature(LineStringFeature);

    const vectorLayer = new VectorLayer({
      source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#f00',
          width: 4
        }),
        image: new Circle({
          radius: 2,
          fill: new Fill({
            color: '#f00'
          })
        })
      })
    });
    this.map.addLayer(vectorLayer); // 将绘制层添加到地图容器中

    let i = 0;
    const interval = setInterval(() => {
      const point = olProj.transform(this.coordinate2[i], 'EPSG:4326', 'EPSG:3857');
      geometry.appendCoordinate(point);
      i += 1;
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
    }, 7000);
  }

  render() {
    return (
      <>
        <div style={{ width: '800px', height: '400px' }} id="map"></div>
      </>
    );
  }
}
