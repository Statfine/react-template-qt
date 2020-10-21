import React from 'react';

export default class SonPage extends React.PureComponent {

  UNSAFE_componentWillMount() { // eslint-disable-line
    console.log('S componentWillMount');
  }

  componentDidMount() {
    console.log('S componentDidMount');
  }

  render() {
    console.log('S render');
    return (
      <div>
        son
      </div>
    )
  }
}