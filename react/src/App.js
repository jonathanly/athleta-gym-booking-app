import React from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import { signOut } from './api/auth';
import UserRegistrationForm from './components/Auth/UserRegistrationForm';
import TrainingSession from './components/TrainingSession/TrainingSession';
import SignInForm from './components/Auth/SignInForm';
import Home from './Home.js'

import { Link, Match, Miss } from 'react-router';

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
      logInControl = <li onClick={this.onSignOut}>Log Out</li>;
    } else {
      logInControl = <Link to='/signin'>Log In</Link>;
    };

    return (
      <div className="App">
        <ul className="main-navigation">
          <li><Link to='/'>Home</Link></li>
          <li><Link to="/register">Sign Up</Link></li>
          <li><Link to="/timetable">Training Sessions</Link></li>
          { logInControl }
        </ul>

        <Match pattern='/' exactly component={Home} />
        <Match pattern='/register' render={ () => <UserRegistrationForm onUserSignedIn={ this.onUserSignedIn } /> } />
        <Match pattern='/signin' render={ () => <SignInForm onUserSignedIn={this.onUserSignedIn} /> } />
        <Match pattern='/timetable' component={TrainingSession} />
      </div>
    );
  }
}

export default App;

// <SignInForm onUserSignedIn={this.onUserSignedIn} />
