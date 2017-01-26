import React from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import { signOut } from './api/auth';
import SignUpForm from './components/Auth/SignUpForm';
import TrainingSessionContainer from './components/TrainingSession/TrainingSessionContainer';
import SignInForm from './components/Auth/SignInForm';
import Home from './components/Layout/Home';
import NotFound from './components/Shared/NotFound';
import Booking from './components/Booking/Booking';

import { Link, Match, Miss } from 'react-router';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
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
      logInControl = <Link to='/login'><li><strong>Log In</strong></li></Link>;
    };

    return (
      <div className="App">
        {/* Sidedrawer  */}
        <div id="sidedrawer" className="mui--no-user-select">
            <div id="sidedrawer-brand" className="mui--appbar-line-height">
              <span className="mui--text-title">
                <img className="sidedrawer-img" src={require('./images/logo.png')} alt="Athleta 24/7 Gym"></img>
              </span>
            </div>
          <div className="mui-divider"></div>
          <ul>
            <Link to='/'><li><strong>Home</strong></li></Link>
            { logInControl }
            <Link to="/signup"><li><strong>Sign Up</strong></li></Link>
            <Link to="/trainingSessions"><li><strong>Training Sessions</strong></li></Link>
            <Link to="/bookings"><li><strong>Book</strong></li></Link>
          </ul>
        </div>

        {/* Header */}
        <header id="header">
          <div className="mui-appbar mui--appbar-line-height">
            <div className="mui-container-fluid">
              <a className="sidedrawer-toggle mui--visible-xs-inline-block mui--visible-sm-inline-block js-show-sidedrawer">☰</a>
              <a className="sidedrawer-toggle mui--hidden-xs mui--hidden-sm js-hide-sidedrawer">☰</a>
              <span className="mui--text-title mui--visible-xs-inline-block">Athleta 24/7</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div id="content-wrapper">
          <div className="mui--appbar-height"></div>
          <div className="mui-container-fluid">
            <Match exactly pattern='/' component={Home} />
            <Match exactly pattern='/signup' render={() => <SignUpForm onUserSignedIn={this.onUserSignedIn} />} />
            <Match exactly pattern='/login' render={() => <SignInForm onUserSignedIn={this.onUserSignedIn} />} />
            <Match pattern='/trainingSessions' component={TrainingSessionContainer} />
            <Match pattern='/bookings' render={() => <Booking currentUser={this.state.currentUser} />} />
            <Miss component={NotFound} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;

// <SignInForm onUserSignedIn={this.onUserSignedIn} />

{/* <ul className="main-navigation">
  <li><Link to='/'>Home</Link></li>
  <li><Link to="/signup">Sign Up</Link></li>
  <li><Link to="/trainingSessions">Training Sessions</Link></li>
  <li><Link to="/bookings">Book</Link></li>
  { logInControl }
</ul> */}
