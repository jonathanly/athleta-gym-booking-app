import React from 'react';
import { Link } from 'react-router';
import '../../App.css';

const Sidebar = ({logInControl}) => {
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
        <Link to="/trainingSessions"><li><strong>Training Sessions</strong></li></Link>
        <Link to="/timetable"><li><strong>Group Training Timetable</strong></li></Link>
        <Link to="/bookings"><li><strong>Book</strong></li></Link>
        <Link to="/signup"><li><strong>Sign Up</strong></li></Link>
        {logInControl}
      </ul>
    </div>
  )
}

export default Sidebar;
