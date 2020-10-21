import React from 'react';

import SonPage from './son';

export default class LifePage extends React.PureComponent {

  UNSAFE_componentWillMount() { // eslint-disable-line
    console.log('F componentWillMount');
  }

  componentDidMount() {
    console.log('F componentDidMount');
  }

  render() {
    console.log('F render');
    return (
      <div>
        LifePage
        <SonPage />
      </div>
    )
  }
}