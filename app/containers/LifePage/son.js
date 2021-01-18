import React from 'react';

export default class SonPage extends React.PureComponent {
  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    console.log('S componentWillMount');
  }

  componentDidMount() {
    console.log('S componentDidMount');
  }

  render() {
    console.log('S render');
    return <div>son</div>;
  }
}
