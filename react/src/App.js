import React from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import TrainingSession from './components/TrainingSession/TrainingSession'

import './App.css';

class App extends React.Component {
  render() {
    return (
        <div className="App">
          <TrainingSession />
        </div>
    );
  }
}

export default App;
