/**
 *
 * NpmPage
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
import { SayName } from 'easub-ui-demo';
import { localStorageCookie } from 'easub-ui-demo/lib/utils';

function NpmPage() {
  localStorageCookie.setCookie('na', 'hello word');
  return (
    <div>
      <SayName />
    </div>
  );
}

NpmPage.propTypes = {};

export default NpmPage;
