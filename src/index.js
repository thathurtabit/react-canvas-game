import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/pages/App';
import WebFont from 'webfontloader';
import registerServiceWorker from './registerServiceWorker';

WebFont.load({
  google: {
    families: ['VT323']
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
