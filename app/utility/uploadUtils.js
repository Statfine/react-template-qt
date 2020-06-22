// import { API_BASE } from 'common/constants';
// import { message } from 'antd';
// import axios from 'axios';

// const FileApi = 'api/file';
// /**
//  * @params
//  * file 文件
//  * url 上传地址
//  * callBackSuc 成功回调
//  * callBackProgress 拿到进度 可选
//  * callBackError 失败回调
//  * options 上传设置选项
//  * {
//  *    ext: string //上传文件类型
//  *    contentType: string //上传设置Header的Content-Type
//  *    callback: bool //是否上传回调服务器 默认为true
//  * }
//  * 返回fileObj
//  * fileObj.cancel()取消上传。
//  */

// export default function uploadCli(
//   file,
//   url,
//   params,
//   callBackSuc,
//   callBackError,
//   options,
//   callBackProgress
// ) {
//   //  判断文件类型获取文件名
//   // const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
//   const fileName = file.name ? file.name.substring(0, file.name.lastIndexOf('.')) : '';
//   let fileExtension;
//   let contentType;
//   if (options.ext) {
//     fileExtension = options.ext;
//   } else {
//     fileExtension = file.name
//       .split('.')
//       .pop()
//       .toLowerCase();
//   }
//   if (options.contentType) {
//     contentType = options.contentType;
//   } else {
//     contentType = fileExtension;
//   }

//   //  创建请求对象
//   const instance = axios.create({
//     headers: {
//       Authorization: `Bearer ${global.window.localStorage.access_token}`,
//     },
//   });

//   //  上传文件对象
//   const fileObj = { name: fileName };
//   let timeOut = '';

//   // 获取上传URL
//   function getUploadUrl() {
//     return instance.get(
//       `${API_BASE}${url}?ext=${fileExtension}&filename=${fileName}`,
//       { params }
//     );
//   }

//   function uploadUrling(url1) {
//     const uploadInstance = axios.create();
//     const CancelToken = axios.CancelToken;
//     const config = {
//       //  获取上传进度
//       onUploadProgress: (progressEvent) => {
//         fileObj.progress = ((parseInt(progressEvent.loaded) / parseInt(progressEvent.total)) * 100).toFixed(0);
//         if (typeof callBackProgress === 'function') {
//           callBackProgress(fileObj, progressEvent);
//         }
//       },
//       cancelToken: new CancelToken((c) => {
//         fileObj.cancel = () => {
//           if (timeOut) clearTimeout(timeOut);
//           c();
//         };
//       }),
//       headers: {
//         'Content-Type': contentType,
//       },
//     };
//     return uploadInstance.put(url1, file, config);
//   }

//   // function oosCallBack(url1, src) {
//   //   instance
//   //     .post(url1, { src })
//   //     .then((response) => {
//   //       callBackSuc(fileObj, response);
//   //     })
//   //     .catch((error) => {
//   //       callBackError(error, fileObj);
//   //     });
//   // }

//   // 每隔1秒获取文件详情 (转码)
//   function repeatFetchFileInfo(fileId) {
//     return new Promise((resolve, reject) => {
//       (function getFileInfo() {
//         instance.get(`${API_BASE}/${FileApi}/${fileId}`).then((result) => {
//           const res = result.data;
//           if (res.data.status === 'waiting' || res.data.status === "processing") timeOut = setTimeout(getFileInfo, 1500);
//           else if (res.data.status === 'completed') resolve(res.data);
//           else reject(res.data);
//         });
//       })()
//     })
//   }

//   let fileId = '';
//   getUploadUrl()
//     .then((result) => {
//       const response = result.data;
//       if (response.code === '401') { // 没用权限
//         message.error('没有权限访问');
//         window.reload();
//         throw new Error();
//       }
//       fileId = response.data.file_id;
//       return uploadUrling(response.data.upload_url);
//     })
//     .then(() => repeatFetchFileInfo(fileId))
//     .then((response) => callBackSuc(response))
//     .catch((error) => {
//       console.log('上传失败');
//       if (axios.isCancel(error)) {
//         console.log('Request canceled', error.message);
//       } else {
//         console.log('上传失败');
//         // handle error
//         callBackError(error, fileObj);
//       }
//     });
//   return fileObj;
// }
