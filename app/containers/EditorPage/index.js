import React from 'react';
import BraftEditor from 'braft-editor';

import 'braft-editor/dist/index.css';
import 'braft-extensions/dist/table.css';
import 'braft-extensions/dist/code-highlighter.css';
// 引入表情包扩展模块样式文件
import 'braft-extensions/dist/emoticon.css';
import 'braft-extensions/dist/color-picker.css';

import Table from 'braft-extensions/dist/table';
import Markdown from 'braft-extensions/dist/markdown';
import ColorPicker from 'braft-extensions/dist/color-picker';
import HeaderId from 'braft-extensions/dist/header-id';
import MaxLength from 'braft-extensions/dist/max-length';

// 首先需要从prismjs中引入需要扩展的语言库
import CodeHighlighter from 'braft-extensions/dist/code-highlighter';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';

// 引入表情包扩展模块和默认表情包列表
import Emoticon, { defaultEmoticons } from 'braft-extensions/dist/emoticon';
const highlighterOptions = {
  syntaxs: [
    {
      name: 'JavaScript',
      syntax: 'javascript',
    },
    {
      name: 'HTML',
      syntax: 'html',
    },
    {
      name: 'CSS',
      syntax: 'css',
    },
    {
      name: 'Java',
      syntax: 'java',
    },
    {
      name: 'PHP',
      syntax: 'php',
    },
  ],
};
BraftEditor.use(Table()); // 表格模块 Table
BraftEditor.use(Markdown()); // Markdown语法支持
BraftEditor.use(CodeHighlighter(highlighterOptions)); // 代码高亮模块
BraftEditor.use(ColorPicker()); // 高级取色器模块
BraftEditor.use(MaxLength()); //  输入字数限制模块

// 转换默认表情包列表，让webpack可以正确加载到默认表情包中的图片，请确保已对png格式的文件配置了loader
// 如果你使用的webpack版本不支持动态require，或者使用的其他打包工具，请勿使用此写法
const emoticons = defaultEmoticons.map(item =>
  // eslint-disable-next-line
  require(`braft-extensions/dist/assets/${item}`),
);
// 也可以使用自己的表情包资源，不受打包工具限制
// const emoticons = ['http://path/to/emoticon-1.png', 'http://path/to/emoticon-2.png', 'http://path/to/emoticon-3.png', 'http://path/to/emoticon-4.png', ...]

const emoticonOptions = {
  emoticons, // 指定可用表情图片列表，默认为空
  closeOnBlur: true, // 指定是否在点击表情选择器之外的地方时关闭表情选择器，默认false
  closeOnSelect: false, // 指定是否在选择表情后关闭表情选择器，默认false
};

BraftEditor.use(Emoticon(emoticonOptions)); // 表情包扩展模块
BraftEditor.use(HeaderId());

function EditorPage() {
  const [editorState, setEditorState] = React.useState();

  React.useEffect(() => {
    // const options = {
    //   defaultColumns: 3, // 默认列数
    //   defaultRows: 3, // 默认行数
    //   withDropdown: false, // 插入表格前是否弹出下拉菜单
    //   columnResizable: false, // 是否允许拖动调整列宽，默认false
    //   exportAttrString: '', // 指定输出HTML时附加到table标签上的属性字符串
    //   includeEditors: ['editor-id'], // 指定该模块对哪些BraftEditor生效，不传此属性则对所有BraftEditor有效
    //   excludeEditors: ['editor-id']  // 指定该模块对哪些BraftEditor无效
    // };
    // 通过opitons.
    // BraftEditor.use(Table(options));
    // BraftEditor.use(Markdown(options));
    // BraftEditor.use(CodeHighlighter(highlighterOptions));
  }, []);

  const handleEditorChange = value => {
    setEditorState(value);
  };

  const submitContent = async () => {
    // Pressing ctrl + s when the editor has focus will execute this method
    // Before the editor content is submitted to the server, you can directly call editorState.toHTML () to get the HTML content
    const htmlContent = editorState.toHTML();
    console.log('htmlContent', htmlContent);
  };

  return (
    <div
      className="editor-container"
      style={{ margin: '20px', border: '1px solid #e3e3e3' }}
    >
      <BraftEditor
        maxLength={100}
        onReachMaxLength={() => console.log('不能再输入了！')}
        id="editor-id"
        value={editorState}
        onChange={handleEditorChange}
        onSave={submitContent}
      />
      <div onClick={submitContent}>Save</div>
    </div>
  );
}

export default EditorPage;
