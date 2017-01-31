import React from 'react';
import AccountDetails from './AccountDetails';
import AccountBookings from './AccountBookings';

class Account extends React.Component {
  render() {
    return(
      <div>
        <h3>Account Details</h3>
        <AccountDetails currentUser={this.props.currentUser} />
        <hr />
        <h3>Bookings</h3>
        <AccountBookings currentUser={this.props.currentUser} />
      </div>
    )
  }
}

export default Account;
