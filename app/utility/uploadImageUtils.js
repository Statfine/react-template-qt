// import axios from 'axios';
// import { API_BASE } from 'common/constants';

// /**
//  * @params
//  * 图片文件上传
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


// const FileApi = 'api/file';
// export default function uploadCli(
//   file,
//   url,
//   callBackProgress,
//   callBackSuc,
//   callBackError,
//   options,
//   params,
// ) {
//   //  判断文件类型获取文件名
//   const fileName = file.name ? file.name.substring(0, file.name.lastIndexOf('.')) : '';
//   // let uploadHeader = {};
//   let fileExtension;
//   // let contentType;
//   if (options && options.ext) {
//     fileExtension = options.ext;
//   } else {
//     fileExtension = file.name
//       .split('.')
//       .pop()
//       .toLowerCase();
//   }
//   // if (options.contentType) {
//   //   contentType = options.contentType;
//   // } else {
//   //   contentType = fileExtension;
//   // }

//   const token = global.window.localStorage.access_token;
//   //  创建请求对象
//   const instance = axios.create({
//     headers: token ? {
//       Authorization: `Bearer ${global.window.localStorage.access_token}`,
//     } : {},
//   });

//   //  上传文件对象
//   const fileObj = { name: fileName };

//   // 获取上传URL
//   function getUploadUrl() {
//     return instance.get(
//       // `${API_BASE}${url}`,
//       `${API_BASE}${url}?ext=${fileExtension}&filename=${fileName}&content_type=${fileExtension}`,
//       { params }
//     );
//   }

//   // 上传
//   function uploadUrling(url1) {
//     console.log(url1)
//     const uploadInstance = axios.create();
//     const CancelToken = axios.CancelToken;
//     const config = {
//       //  获取上传进度
//       onUploadProgress: (progressEvent) => {
//         fileObj.progress = (
//           parseInt(progressEvent.loaded) /
//           parseInt(progressEvent.total) *
//           100
//         ).toFixed(0);
//         if (typeof callBackProgress === 'function') {
//           callBackProgress(fileObj, progressEvent);
//         }
//       },
//       cancelToken: new CancelToken((c) => {
//         fileObj.cancel = c;
//       }),
//       headers: {
//         'Content-Type': fileExtension,
//       },
//     };
//     return uploadInstance.put(url1, file, config);
//   }

//   // 上传成功之后获取资源地址
//   function idGetFile(fileId) {
//     if (token) {
//       return instance.get(`${API_BASE}/${FileApi}/${fileId}`);
//     } 
//     return instance.get(`${API_BASE}/api/file/public/${fileId}`);
    
//   }

//   let fileId = '';
//   getUploadUrl()
//     .then((response) => {
//       fileId = response.data.data.file_id;
//       // uploadHeader = response.data.data.headers;
//       return uploadUrling(response.data.data.upload_url);
//     })
//     .then(() => idGetFile(fileId))
//     .then((response) => {
//       const data = response.data.data;
//       callBackSuc(fileObj, { uploadImageId: data.file_id, src: data.preview_url });
//     })
//     .catch((error) => {
//       if (axios.isCancel(error)) {
//         console.log('Request canceled', error.message);
//         console.log('error')
//         callBackError(error, fileObj);
//       } else {
//         console.log('error')
//         // handle error
//         callBackError(error, fileObj);
//       }
//     });
//   return fileObj;
// }
