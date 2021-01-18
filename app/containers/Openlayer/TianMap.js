import React, { PureComponent } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';

import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

export default class TianMap extends PureComponent {
  componentDidMount() {
    this.initData();
  }

  /**
   *  矢量底图
   * 	http://t0.tianditu.gov.cn/vec_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/vec_w/wmts?tk=您的密钥	球面墨卡托投影
   * 	矢量注记
   * 	http://t0.tianditu.gov.cn/cva_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/cva_w/wmts?tk=您的密钥	球面墨卡托投影
   * 	影像底图
   * 	http://t0.tianditu.gov.cn/img_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/img_w/wmts?tk=您的密钥	球面墨卡托投影
   * 	影像注记
   * 	http://t0.tianditu.gov.cn/cia_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/cia_w/wmts?tk=您的密钥	球面墨卡托投影
   * 	地形晕渲
   * 	http://t0.tianditu.gov.cn/ter_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/ter_w/wmts?tk=您的密钥	球面墨卡托投影
   * 	地形注记
   * 	http://t0.tianditu.gov.cn/cta_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/cta_w/wmts?tk=您的密钥	球面墨卡托投影
   * 	全球境界
   * 	http://t0.tianditu.gov.cn/ibo_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/ibo_w/wmts?tk=您的密钥	球面墨卡托投影
   * 	矢量英文注记
   * 	http://t0.tianditu.gov.cn/eva_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/eva_w/wmts?tk=您的密钥	球面墨卡托投影
   * 	影像英文注记
   * 	http://t0.tianditu.gov.cn/eia_c/wmts?tk=您的密钥	经纬度投影
   * 	http://t0.tianditu.gov.cn/eia_w/wmts?tk=您的密钥	球面墨卡托投影
   *
   * 	地图服务调用
   * 	以天地图影像瓦片底图（球面墨卡托投影）服务为例，在原有瓦片获取请求参数中增加授权参数即可，其余使用方法不变。
   * 	例如：http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={x}&TILECOL={y}&tk=您的密钥
   */

  initData = () => {
    const key = '0f5cb733f04223ac733dc4d36063f44f';
    // const permission = "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={x}&TILECOL={y}&tk=";
    // let permission2="SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&FORMAT=tiles&TILEMATRIXSET=w&STYLE=default&LAYER=vec&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=";
    // 矢量底图http://t2.tianditu.com/DataServer
    // 瓦片的列号x，从0开始；
    // const x = 0;
    // // 瓦片的行号y，从0开始；
    // const y = 0;
    // // 瓦片的级别，1~20；
    // const z = 1;
    // // 矢量底图
    // const vectorUrl1 = "http://t2.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=";
    // // 矢量注记
    // const vectorUrl2 = "http://t2.tianditu.com/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=";
    // // 球面墨卡托投影
    // 矢量底图
    const vectorUrl3 =
      'http://t2.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=';
    // 矢量注记
    const vectorUrl4 =
      'http://t2.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=';

    // //经纬度投影 地形晕渲
    // let mapReder1="http://t2.tianditu.com/DataServer?T=ter_c&x={x}&y={y}&l={z}&tk=";
    // //影像底图
    // let img1="http://t2.tianditu.com/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=";
    // let img2="http://t2.tianditu.com/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=";

    // eslint-disable-next-line no-unused-vars
    const map = new Map({
      // controls: defaultControls().extend([
      //   new ScaleLine({
      //     units: 'degrees'
      //   })
      // ]),
      target: 'map',
      layers: [
        // new TileLayer({
        //   title: "天地图矢量图层",
        //   source: new XYZ({
        //     // url:vectorUrl1+permission+key,
        //     url: vectorUrl1+key,
        //     wrapX: false
        //   })
        // }),
        // new TileLayer({
        //   title: "天地图矢量图层注记",
        //   source: new XYZ({
        //     // url:vectorUrl1+permission+key,
        //     url: vectorUrl2+key,
        //     wrapX: false
        //   })
        // }),

        // 球面墨卡托
        new TileLayer({
          title: '天地图矢量图层',
          source: new XYZ({
            // url:vectorUrl1+permission+key,
            url: vectorUrl3 + key,
            wrapX: false,
          }),
        }),
        new TileLayer({
          title: '天地图矢量图层注记',
          source: new XYZ({
            // url:vectorUrl1+permission+key,
            url: vectorUrl4 + key,
            wrapX: false,
          }),
        }),
        // new TileLayer({
        //   title: "天地图影像图层",
        //   source: new XYZ({
        //     // url:vectorUrl1+permission+key,
        //     url: img1+key,
        //     // wrapX: false
        //   })
        // }),
        // new TileLayer({
        //   title: "天地图影像图层注记",
        //   source: new XYZ({
        //     // url:vectorUrl1+permission+key,
        //     url: img2+key,
        //     // wrapX: false
        //   })
        // }),
        // new TileLayer({
        //   title: "天地图矢量图层注记",
        //   source: new XYZ({
        //     // url: "http://t2.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=3bc6874f2b919aa581635abab7759a3f&tk=3bc6874f2b919aa581635abab7759a3f",
        //     url:vectorUrl2+permission+key,
        //     // wrapX: false
        //   })
        // }),
        // new TileLayer({
        //   title: "天地图地形晕渲",
        //   source: new XYZ({
        //     // url: "http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=3bc6874f2b919aa581635abab7759a3f&tk=3bc6874f2b919aa581635abab7759a3f",
        //     url:mapReder1+permission+key,
        //     wrapX: false
        //   })
        // })

        // new TileLayer({
        //   source: new OSM(),
        //   projection: 'EPSG:4326', //HERE IS THE DATA SOURCE PROJECTION
        //   url: 'http://demo.boundlessgeo.com/geoserver/wms',
        //   params: {
        //     'LAYERS': 'ne:NE1_HR_LC_SR_W_DR'
        //   }
        // })
      ],
      view: new View({
        // 地图初始中心点  116.383707,39.99973
        center: [0, 0],
        // 地图初始显示级别
        zoom: 3,
        // 参考系设置
        projection: 'EPSG:4326',
      }),
    });
  };

  render() {
    return (
      <>
        <div style={{ width: '600px', height: '600px' }} id="map" />
      </>
    );
  }
}
