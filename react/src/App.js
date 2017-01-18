import React from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import TrainingSession from './components/TrainingSession/TrainingSession';
import SignInForm from './components/Auth/SignInForm';
import { signOut } from './api/auth';
import UserRegistrationForm from './components/Auth/UserRegistrationForm';

import { Button } from 'muicss/react';

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
    this.onSignOut = this.onSignOut.bind(this);
  }

  onUserSignedIn(user) {
    this.setState({ currentUser: user })
  }

  onSignOut(){
    this.setState({ currentUser: null })
    signOut();
  }

  render() {
    const isLoggedIn = !!this.state.currentUser;
    let logInControl = null;
    if (isLoggedIn) {
      logInControl = <Button onClick={this.onSignOut}>Sign Out</Button>;
    } else {
      logInControl = <SignInForm onUserSignedIn={this.onUserSignedIn} />;
    };

    return (
      <div className="App">
        { logInControl }
        <UserRegistrationForm onUserSignedIn={this.onUserSignedIn} />
        <TrainingSession />
      </div>
    );
  }
}

export default App;
