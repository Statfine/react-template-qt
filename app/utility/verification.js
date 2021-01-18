function testFileNameImg(name) {
  const regExp = /\.(jpg|jpeg|png|gif)$/;
  return regExp.test(name.toLowerCase());
}

function testFileNameAudio(name) {
  const regExp = /\.(mp3)$/;
  return regExp.test(name.toLowerCase());
}

function testFileNameVideo(name) {
  return /\.(3g2|3gp|a64|amr|apng|asf|avi|cavsvideo|dv|flv|hds|mjpeg|mpegts|ts|rawvideo|vc1|wav|webm|oma|mj2|vivo|xmv|wmvhd|wmv|vob|dat|mp4|mkv|rm|rmvb|mov|ogg|ogv|oga|mod|mpeg|mts|m4v)$/.test(
    name.toLowerCase(),
  );
}

function testUrl(url) {
  const exp = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/; // eslint-disable-line
  return exp.test(url);
}

function testEmail(email) {
  const re = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
  return re.test(email);
}

// 身份证
function testID(ID) {
  const re = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
  return re.test(ID);
}

function testNumber(number) {
  const re = /^\d+$/;
  return re.test(number);
}

// 支持小数的正则
function testDecimalsNumber(number) {
  // const re = /^[1-9][0-9]*(\.[0-9]{1,x})?$/;
  const re = /^[0-9]+([.]{1}[0-9]+){0,1}$/;
  return re.test(number);
}

function testPhoneNumber(phone) {
  const reg = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;
  return reg.test(phone);
}

function testTelNumber(phone) {
  const reg = /(\d{2,5}-\d{7,8})/;
  // const reg = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
  return reg.test(phone);
}

function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); // eslint-disable-line
  }
  return (`${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`);
}

// console.log(testFileNameVideo("1.avi"));
export {
  testFileNameImg,
  testFileNameAudio,
  testFileNameVideo,
  testUrl,
  testEmail,
  testID,
  testNumber,
  testPhoneNumber,
  testTelNumber,
  guid,
  testDecimalsNumber,
};
