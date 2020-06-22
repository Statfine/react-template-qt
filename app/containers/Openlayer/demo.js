/* eslint-disable */
import React, { PureComponent } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Source from 'ol/source/OSM';
import TileImage from 'ol/source/TileImage';

export default class OpenLayer extends PureComponent {
  componentDidMount() {
    this.initData();
  }

  initData = () => {
    const map = new Map({
      target: 'map',
      // layers: [
      //   new TileLayer({
      //     source: new XYZ({
      //       url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //     }),
      //   }),
      // ],
      layers: [
        new TileLayer({                 // 瓦片图层
          source: new Source()     // OpenStreetMap数据源
        })
      ],
      // layers: [
      //   this.loadBaiduMap(),
      // ],
      // layers: [
      //   this.gaodeLayerTile(),
      // ],
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
    const urlTemplate = "http://online2.map.bdimg.com/tile/?qt=tile&x=" + '{x}' + "&y=" + '{y}' + "&z=" + '{z}' + "&styles=pl&udt=20141219&scaler=1";
    // 通过范围计算得到地图分辨率数组resolutions
    const resolutions = this.getResolutions(extent, tileSize);
    // 实例化百度地图数据源
    const baiduSource = new TileImage({
      // attributions: [attribution],
      tileUrlFunction: (tileCoord, pixelRatio, projection) => {
        // 判断返回的当前级数的行号和列号是否包含在整个地图范围内
        if (this.tileGrid != null) {
          const tileRange = this.tileGrid.getTileRangeForExtentAndZ(extent, tileCoord[0], tileRange);
          if (!tileRange.contains(tileCoord)) {
            return null;
          }
        }
        const z = tileCoord[0];
        const x = tileCoord[1];
        const y = tileCoord[2];
        return urlTemplate.replace('{z}', z.toString()).replace('{y}', y.toString()).replace('{x}', x.toString());
      },
      projection: Proj.get('EPSG:3857'), // 投影坐标系
      tileGrid: new TileLayer({
        origin, // 原点，数组类型，如[0,0],
        resolutions, // 分辨率数组
        tileSize, // 瓦片图片大小
      })
    });
    // 实例化百度地图瓦片图层
    const baiduLayer = new TileLayer({
      source: baiduSource
    });
    // map.addLayer(baiduLayer); //添加Baidu地图图层
    return baiduLayer;
  }

  /**
   * 通过范围计算得到地图分辨率数组resolutions
   * @param extent
   * @param tileSize
   * @returns {any[]}
   */
  getResolutions = (extent, tileSize) => {
    const olE = new OlEvent();
    const width = olE.getWidth(extent);
    const height = olE.getHeight(extent);
    const maxResolution = (width <= height ? height : width) / (tileSize); // 最大分辨率
    const resolutions = new Array(16);
    for (let z = 0; z < 16; ++z) {
      resolutions[z] = maxResolution / Math.pow(2, z);
    }
    return resolutions; // 返回分辩率数组resolutions
  }

  gaodeLayerTile = () => new TileLayer({
    source: new XYZ({
      url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
    })
  });  

  render() {
    return <>
      <div id="map" style={{width:"600px", height:"400px"}}></div>
    </>;
  }
}
