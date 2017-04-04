import React from 'react';
import 'whatwg-fetch'; // Polyfills window.fetch
import { signOut } from './api/auth';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';

// Layouts
import Home from './components/Shared/Home';
import Sidebar from './components/Shared/Sidebar';
import Header from './components/Shared/Header';
import NotFound from './components/Shared/NotFound';
import Timetable from './components/Shared/Timetable';

// Components
import Booking from './components/Booking/Booking';
import SignInForm from './components/Auth/SignInForm';
import SignUpForm from './components/Auth/SignUpForm';
import TrainingSessionContainer from './components/TrainingSession/TrainingSessionContainer';
import Account from './components/Account/Account';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentUser: null
    }

    this.onUserSignedIn = this.onUserSignedIn.bind(this);
    this.onSignOut = this.onSignOut.bind(this);
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
      logInControl = <li onClick={this.onSignOut}><strong>Log Out</strong></li>;
    } else {
      logInControl = <Link to='/signin'><li><strong>Log In</strong></li></Link>;
    };

    return (
      <BrowserRouter>
        <div className="App">
          <Header />
          <Sidebar logInControl={logInControl} isLoggedIn={isLoggedIn}/>

          {/* Main Content */}
          <div id="content-wrapper">
            <div className="mui--appbar-height"></div>
            <div className="mui-container-fluid">
            {/* <Switch> */}
              <Route exact strict path='/' component={Home} />
              <Route exact strict path='/signup' render={() => <SignUpForm onUserSignedIn={this.onUserSignedIn} />} />
              <Route exact strict path='/signin' render={() => <SignInForm onUserSignedIn={this.onUserSignedIn} />} />
              <Route exact strict path='/trainingSessions' component={TrainingSessionContainer} />
              <Route exact strict path='/bookings' render={() => <Booking currentUser={this.state.currentUser} />} />
              <Route exact strict path='/account' render={() => <Account currentUser={this.state.currentUser} onUserSignedIn={this.onUserSignedIn}/>} />
              <Route exact strict path='/timetable' component={Timetable} />
            {/* </Switch> */}
              {/* There is no longer a Miss component <Miss component={NotFound} /> */}
            </div>
            {/* <Route pattern='/timetable' component={Timetable} /> */}
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
