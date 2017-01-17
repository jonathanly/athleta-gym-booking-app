import React from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import TrainingSession from './components/TrainingSession/TrainingSession';
import SignInForm from './components/Auth/SignInForm';
import UserRegistrationForm from './components/Auth/UserRegistrationForm';

import './App.css';

class App extends React.Component {
  render() {
    return (
        <div className="App">
          <SignInForm />
          <UserRegistrationForm />
          <TrainingSession />
        </div>
    );
  }
}

export default App;
