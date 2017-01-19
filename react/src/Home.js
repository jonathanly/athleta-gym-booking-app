import React from 'react';
import { Button } from 'muicss/react';
import { Link } from 'react-router';

class Home extends React.Component {
  render() {
    return (
      <div>
        <h1>Welcome to Athleta Group Training Booking App</h1>
        <div>
          <Link to='/register'><Button variant="raised" color="primary">New User?</Button></Link>
          <Link to='/signin'><Button variant="raised" color="danger">Log in</Button></Link>
        </div>
      </div>
    )
  }
}

export default Home;
