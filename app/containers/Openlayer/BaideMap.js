/* eslint-disable */
import React, { PureComponent } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';

import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileImage from 'ol/source/TileImage';
import Tile from 'ol/Tile';
import { get } from 'ol/proj';
import * as olProj from 'ol/proj';
import * as olExtent from 'ol/extent';

export default class BaiduMap extends PureComponent {
  UrlFunction = (tileCoord, pixelRatio, proj) => {
    if (!tileCoord) {
      return '';
    }
    let z = tileCoord[0];
    let x = tileCoord[1];
    let y = tileCoord[2];

    if (x < 0) {
      x = 'M' + -x;
    }
    if (y < 0) {
      y = 'M' + -y;
    }
    return (
      'http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=' +
      x +
      '&y=' +
      y +
      '&z=' +
      z +
      '&styles=pl&udt=20151021&scaler=1&p=1'
    );
  };

  getResolutions = (extent, tileSize) => {
    const width = extent.getWidth(extent);
    const height = extent.getHeight(extent);
    const maxResolution = (width <= height ? height : width) / tileSize; //最大分辨率
    const resolutions = new Array(16);
    for (let z = 0; z < 16; ++z) {
      resolutions[z] = maxResolution / Math.pow(2, z);
    }
    return resolutions; // 返回分辩率数组resolutions
  };

  componentDidMount() {
    // 坐标参考系
    const projection = get('EPSG:3857');
    // 分辨率
    const resolutions = [];
    for (let i = 0; i < 18; i++) {
      resolutions[i] = Math.pow(2, 17 - i);
    }
    const tilegrid = new TileGrid({
      origin: [0, 0],
      resolutions,
    });
    // 拼接百度地图出图地址
    const baiduSource = new TileImage({
      // 设置坐标参考系
      projection,
      // 设置分辨率
      tileGrid: tilegrid,
      // 出图基地址
      tileUrlFunction: this.UrlFunction,
    });
    // 百度地图
    const baiduLayer = new TileLayer({
      source: baiduSource,
    });
    //地图容器
    let map = new Map({
      target: 'map',
      layers: [baiduLayer],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  }

  initData = () => {
    const map = new Map({
      target: 'map',
      layers: [this.loadBaiduMap()],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  };

  /**
   * 加载百度地图
   * @returns {ol.layer.Tile}
   */
  loadBaiduMap = () => {
    // 数据源信息
    // const attribution = new ol.Attribution({
    //   html: 'Copyright:&copy; 2015 Baidu, i-cubed, GeoEye'
    // });
    // 地图范围
    const extent = [-20037508.34, -20037508.34, 20037508.34, 20037508.34];
    // 瓦片大小
    const tileSize = 256;
    // 瓦片参数原点
    const origin = [0, 0];
    // 百度地图在线服务地址
    const urlTemplate =
      'http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=' +
      '{x}' +
      '&y=' +
      '{y}' +
      '&z=' +
      '{z}' +
      '&styles=pl&udt=20141219&scaler=1';
    // 通过范围计算得到地图分辨率数组resolutions
    const resolutions = this.getResolutions(extent, tileSize);
    // 实例化百度地图数据源
    const baiduSource = new TileImage({
      // attributions: [attribution],
      tileUrlFunction: (tileCoord, pixelRatio, projection) => {
        // 判断返回的当前级数的行号和列号是否包含在整个地图范围内
        if (this.tileGrid != null) {
          const tileRange = this.tileGrid.getTileRangeForExtentAndZ(
            extent,
            tileCoord[0],
            tileRange,
          );
          if (!tileRange.contains(tileCoord)) {
            return null;
          }
        }
        const z = tileCoord[0];
        const x = tileCoord[1];
        const y = tileCoord[2];
        return urlTemplate
          .replace('{z}', z.toString())
          .replace('{y}', y.toString())
          .replace('{x}', x.toString());
      },
      projection: olProj.get('EPSG:3857'), // 投影坐标系
      tileGrid: new TileGrid({
        origin, // 原点，数组类型，如[0,0],
        resolutions, // 分辨率数组
        tileSize, // 瓦片图片大小
      }),
    });
    // 实例化百度地图瓦片图层
    const baiduLayer = new TileLayer({
      source: baiduSource,
    });
    // map.addLayer(baiduLayer); //添加Baidu地图图层
    return baiduLayer;
  };

  /**
   * 通过范围计算得到地图分辨率数组resolutions
   * @param extent
   * @param tileSize
   * @returns {any[]}
   */
  getResolutions = (extent, tileSize) => {
    const width = olExtent.getWidth(extent);
    const height = olExtent.getHeight(extent);
    const maxResolution = (width <= height ? height : width) / tileSize; // 最大分辨率
    const resolutions = new Array(16);
    for (let z = 0; z < 16; ++z) {
      resolutions[z] = maxResolution / Math.pow(2, z);
    }
    return resolutions; // 返回分辩率数组resolutions
  };

  render() {
    return (
      <>
        <div id="map" style={{ width: '600px', height: '600px' }}></div>
      </>
    );
  }
}
