import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';

import registerServiceWorker from './registerServiceWorker';

import { createStore } from 'redux';
import { processAction } from './reducers/index';
import { StoreState } from './types/index';
import { AppAction } from './actions';
import { Provider } from 'react-redux';

export const store = createStore<StoreState, AppAction, any, any>(processAction);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
