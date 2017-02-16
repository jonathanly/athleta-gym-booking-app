import React from 'react';
import { Link } from 'react-router';
import '../../App.css';

const display = {
  active: {
    display: 'inherit'
  },
  inactive: {
    display: 'none'
  }
};

class Sidebar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      trainingSessionActive: false
    }

    this.toggleTrainingSession = this.toggleTrainingSession.bind(this);
  }

  toggleTrainingSession() {
    this.setState({ trainingSessionActive: !this.state.trainingSessionActive })
  }

  render() {
    const trainingSessionStyle = this.state.trainingSessionActive ? display.active : display.inactive

    
    return (
      <div id="sidebar" className="mui--no-user-select">
        <div id="sidebar-brand" className="mui--appbar-line-height">
          <span className="mui--text-title">
            <img className="sidebar-img" src={require('../../images/logo.png')} alt="Athleta 24/7 Gym"></img>
          </span>
        </div>
        <div className="mui-divider"></div>
        <ul>
          <Link to='/'><li><strong>Home</strong></li></Link>
          <li>
            <strong onClick={this.toggleTrainingSession}>Admin</strong>
            <ul className="sidebar-submenu" style={trainingSessionStyle}>
              <Link to="/trainingSessions"><li>Training Session Index</li></Link>
              <Link to="/trainingSessions/add"><li>Add Training Session</li></Link>
            </ul>
          </li>
          <Link to="/account"><li><strong>Account</strong></li></Link>
          <Link to="/bookings"><li><strong>Bookings</strong></li></Link>
          <Link to="/timetable"><li><strong>Group Training Timetable</strong></li></Link>
          {this.props.logInControl}
        </ul>
      </div>
    )
  }
}

export default Sidebar;
