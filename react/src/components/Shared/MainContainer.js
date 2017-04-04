import React from 'react';
import { Route } from 'react-router-dom';

// Layouts
import Header from './Header';
import Sidebar from './Sidebar';
import Timetable from './Timetable';

// Components
import Booking from '../Booking/Booking';
import TrainingSessionContainer from '../TrainingSession/TrainingSessionContainer';
import Account from '../Account/Account';

import '../../App.css';

class MainContainer extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Sidebar logInControl={this.props.logInControl} currentUser={this.props.currentUser} />

        {/* Main Content */}
        <div id="content-wrapper">
          <div className="mui--appbar-height"></div>
          <div className="mui-container-fluid">

            <Route pattern='/trainingSessions' component={TrainingSessionContainer} />
            <Route pattern='/bookings' render={() => <Booking currentUser={this.props.currentUser} />} />
            <Route pattern='/account' render={() => <Account currentUser={this.props.currentUser} />} />
          </div>
          <Route pattern='/timetable' component={Timetable} />
        </div>
      </div>
    )
  }
}

export default MainContainer;
