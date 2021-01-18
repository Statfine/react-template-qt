/* eslint-disable */
/**
 *
 * AntdPage
 * antd version 3.26.19
 *
 */

import React from 'react';
import { Form, Input, Button } from 'antd';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const AntdPage = props => {
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');

  const {
    getFieldDecorator,
    validateFieldsAndScroll,
    validateFields,
    getFieldsValue,
    setFields,
  } = props.form; // eslint-disable-line

  const handleSubmit = e => {
    e.preventDefault();
    // console.log(getFieldsValue());
    // validateFields(['name'], { force: true });
    // validateFields(['email'], { force: true });
    const va = valadate();
    console.log('va', va);
    // setFields({
    //   name: {
    //     value: '1111',
    //     errors: [new Error('forbid ha')],
    //   },
    // });
  };

  const valadate = () => {
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        return true;
      }
      return false;
    });
  };

  const checkPassword = (rule, value, callback) => {
    console.log(rule, value, callback);
    if (password > 0) {
      return false;
    }
    return true;
  };

  const userName = (rule, value, callback) => {
    if (value.length === 0) callback();
    // 在这里也要写个callback
    else if (value !== 'sj') callback('name error');
  };

  return (
    <div>
      <Form {...formItemLayout}>
        <Form.Item label="E-mail">
          {getFieldDecorator('email', {
            rules: [
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              // {
              //   required: true,
              //   message: 'Please input your E-mail!',
              // },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="name" name="name">
          {getFieldDecorator('name', {
            rules: [
              {
                validator: userName,
              },
            ],
          })(
            <div>
              <Input
                // value={name}
                onChange={e => setName(e.target.value)}
                id="name"
                style={{ width: 100 }}
              />
              <span>sum</span>
            </div>,
          )}
        </Form.Item>
        <Form.Item label="password">
          {getFieldDecorator('password', {
            rules: [
              {
                required: checkPassword,
              },
            ],
          })(
            <Input
              // value={password}
              onChange={e => setPassword(e.target.value)}
            />,
          )}
        </Form.Item>
      </Form>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default Form.create({})(AntdPage);
