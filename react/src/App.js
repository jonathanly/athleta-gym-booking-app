import React from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import { signOut } from './api/auth';
import UserRegistrationForm from './components/Auth/UserRegistrationForm';
import TrainingSessionContainer from './components/TrainingSession/TrainingSessionContainer';
import SignInForm from './components/Auth/SignInForm';
import Home from './Home';
import NotFound from './components/Shared/NotFound';
import Booking from './components/Booking/Booking';

import { Link, Match, Miss } from 'react-router';

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
    // this.getCurrentUser = this.getCurrentUser.bind(this);
  }

  onUserSignedIn(user) {
    this.setState({ currentUser: user })
  }

  onSignOut() {
    this.setState({ currentUser: null })
    signOut();
  }

  render() {
    const isLoggedIn = !!this.state.currentUser;
    let logInControl = null;
    if (isLoggedIn) {
      logInControl = <li onClick={this.onSignOut}>Log Out</li>;
    } else {
      logInControl = <li><Link to='/login'>Log In</Link></li>;
    };

    return (
      <div className="App">

        <ul className="main-navigation">
          <li><Link to='/'>Home</Link></li>
          <li><Link to="/signup">Sign Up</Link></li>
          <li><Link to="/trainingSessions">Training Sessions</Link></li>
          <li><Link to="/bookings">Book</Link></li>
          { logInControl }
        </ul>

        <Match exactly pattern='/' component={Home} />
        <Match exactly pattern='/signup' render={() => <UserRegistrationForm onUserSignedIn={this.onUserSignedIn} />} />
        <Match exactly pattern='/login' render={() => <SignInForm onUserSignedIn={this.onUserSignedIn} />} />
        <Match pattern='/trainingSessions' component={TrainingSessionContainer} />
        <Match pattern='/bookings' render={() => <Booking currentUser={this.state.currentUser} />} />
        <Miss component={NotFound} />
      </div>
    );
  }
}

export default App;

// <SignInForm onUserSignedIn={this.onUserSignedIn} />
