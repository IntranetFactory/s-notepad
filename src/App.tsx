import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './App.css';
import { Home } from './components/Home';

export const App: React.FunctionComponent = () => {
  return (
    <Router>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/snapshot/:editorLanguage/:sharedContentBase64">
        <Home />
      </Route>
    </Router>
  );
};
