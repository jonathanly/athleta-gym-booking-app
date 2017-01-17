import React from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import TrainingSession from './components/TrainingSession/TrainingSession';
import SignInForm from './components/Auth/SignInForm';
import UserRegistrationForm from './components/Auth/UserRegistrationForm';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      // We first check with the API if a user is signed in
      // needsToCheckSignIn: true,
      currentUser: null
    }

    this.onUserSignedIn = this.onUserSignedIn.bind(this);
  }

  onUserSignedIn(user) {
    this.setState({ currentUser: user })
  }

  render() {
    return (
        <div className="App">
          <SignInForm onUserSignedIn={this.onUserSignedIn}/>
          <UserRegistrationForm onUserSignedIn={this.onUserSignedIn} />
          <TrainingSession />
        </div>
    );
  }
}

export default App;
