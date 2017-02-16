import React from 'react';
import { Button } from 'muicss/react';
import { Link } from 'react-router';
import '../../App.css';

class Home extends React.Component {
  render() {
    return (
      <div className="home">
        <h1>Welcome to Athleta 24/7 Group Training Booking App</h1>
        <div>
          <Link to='/signup'><Button className="home-button" variant="raised" color="primary">New User?</Button></Link>
          <Link to='/signin'><Button className="home-button" variant="raised" color="danger">Log in</Button></Link>
        </div>
      </div>
    )
  }
}

export default Home;
