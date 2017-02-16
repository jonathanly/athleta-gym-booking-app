import React from 'react';
import AccountDetails from './AccountDetails';
import AccountBookings from './AccountBookings';
import SignInForm from '../Auth/SignInForm';

class Account extends React.Component {
  render() {
    if (this.props.currentUser == null) {
      return (
        <div>
          <p>Please log in to your account</p>
          <SignInForm onUserSignedIn={this.props.onUserSignedIn}/>
        </div>
      )
    }

    return(
      <div>
        <h3><strong>Account Details</strong></h3>
        <AccountDetails currentUser={this.props.currentUser} />
        <hr />
        <h3><strong>Bookings</strong></h3>
        <AccountBookings currentUser={this.props.currentUser} />
      </div>
    )
  }
}

export default Account;
