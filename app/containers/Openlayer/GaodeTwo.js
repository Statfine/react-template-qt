import React, { PureComponent } from 'react';
import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';

import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import Vector from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { Icon, Style, Fill, Stroke, Circle } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';

import './index.css';

// 腾讯大厦 113.934514,22.540515
// 星海名城 113.912949,22.537602

export default class Gaode extends PureComponent {
  componentDidMount() {
    const projection = olProj.get('EPSG:3857');
    const navlayer = new TileLayer({
      source: new XYZ({
        url:
          'http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8', // 7,8
        // url:'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}', // 7,8
      }),
      projection,
    });
    const map = new Map({
      target: 'map',
      layers: [navlayer],
      view: new View({
        center: olProj.transform(
          [113.934514, 22.540515],
          'EPSG:4326',
          'EPSG:3857',
        ), // 数据存储在EPSG：4326([106.51, 29.55])中并显示在 EPSG：3857([12958752, 4848452])中
        zoom: 13,
        minZoom: 3,
      }),
    });

    this.showClickPopup(map); // 点击显示弹出
    this.addPoint(map); // 添加坐标点
    this.toLine(map); // 连线
  }

  popover = null;

  // 显示弹出层
  showClickPopup = map => {
    const container = document.getElementById('popup');
    const content = document.getElementById('popup-content');
    const popupCloser = document.getElementById('popup-closer');

    const overlay = new Overlay({
      element: container,
      autoPan: true,
    });

    map.on('click', function (e) {
      const pixel = map.getEventPixel(e.originalEvent);
      const { coordinate } = e; // 获取到的为默认3857
      const clickPosition = olProj.transform(
        coordinate,
        'EPSG:3857',
        'EPSG:4326',
      );
      console.log(
        'pixel',
        pixel,
        coordinate,
        olProj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'),
      );
      content.innerHTML = `<p>经度:${clickPosition[0]}<br />纬度:${clickPosition[1]}`;
      // overlay.setPosition(coordinate);
      map.addOverlay(overlay);
      // //  浮层物的点击事件触发
      map.forEachFeatureAtPixel(pixel, feature => {
        // const hdms = olCoordinate.toStringHDMS(olProj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
        // content.innerHTML = "<p>经度:" + feature.H.j+"纬度:"+feature.H.w + "</p>";
        // feature.getProperties().features.length==1 //只有一个要素
        console.log('forEachFeatureAtPixel', feature);
      });
    });

    popupCloser.addEventListener('click', function () {
      overlay.setPosition(undefined);
    });
  };

  // 添加坐标点
  addPoint = map => {
    const vector = new Vector({
      layerName: 'point',
      source: new VectorSource(),
    });
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'http://openlayers.org/en/latest/examples/data/icon.png',
      }),
    });
    const feature = new Feature({
      // 坐标转换 默认3857
      geometry: new Point(
        olProj.transform(
          [113.91069823740762, 22.518223359444804],
          'EPSG:4326',
          'EPSG:3857',
        ),
      ),
    });

    feature.setId('00002');
    feature.setProperties({
      id: '00002',
      name: '第二个点',
      location: '不知道哪',
    });

    feature.setStyle(iconStyle);

    vector.getSource().addFeature(feature);
    map.addLayer(vector);

    const element = document.getElementById('popup1');
    const popup = new Overlay({
      element,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, 50],
    });
    map.addOverlay(popup);

    map.on('click', function (evt) {
      const { coordinate } = evt; // 获取到的为默认3857
      const featureMap = map.forEachFeatureAtPixel(evt.pixel, function (f) {
        return f;
      });
      // let iconName = featureMap.get('name');
      if (featureMap) {
        if (popup.getPosition()) popup.setPosition();
        else popup.setPosition(coordinate);
      } else {
        //
      }
    });
  };

  toLine = map => {
    const coordinates = [
      [113.912949, 22.537602],
      [113.934514, 22.540515],
      [113.91069823740762, 22.518223359444804],
    ];

    // 声明一个新的数组
    const coordinatesPolygon = [];
    // 循环遍历将经纬度转到"EPSG:4326"投影坐标系下
    for (let i = 0; i < coordinates.length; i += 1) {
      console.log('开始转换坐标');
      const pointTransform = olProj.transform(
        [coordinates[i][0], coordinates[i][1]],
        'EPSG:4326',
        'EPSG:3857',
      );
      coordinatesPolygon.push(pointTransform);
    }
    // 瓦片图层
    // var tileLayer = new ol.layer.Tile({
    //     source:new ol.source.OSM()
    // });
    const source = new VectorSource();
    // 矢量图层
    const vectorLine = new Vector({
      source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.1)',
        }),
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
        image: new Circle({
          radius: 2,
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
      }),
    });
    // 多边形此处注意一定要是[坐标数组]
    console.log(`画线的坐标集合为=${coordinatesPolygon}`);
    const plygon = new Polygon([coordinatesPolygon]);
    // 多边形要素类
    const feature = new Feature({
      geometry: plygon,
    });
    source.addFeature(feature);
    map.addLayer(vectorLine);
  };

  render() {
    return (
      <>
        <div style={{ width: '800px', height: '400px' }} id="map">
          <div id="popup1">popup</div>
        </div>
        <div id="popup" className="ol-popup">
          <div id="popup-closer" className="ol-popup-closer" />
          <div id="popup-content"></div>
        </div>
      </>
    );
  }
}
