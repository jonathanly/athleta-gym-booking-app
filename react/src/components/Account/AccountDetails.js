import React from 'react';

class AccountDetails extends React.Component {
  render() {
    const { email, firstName, lastName } = this.props.currentUser.user;

    return (
      <div>
        <h4>Email: { email }</h4>
        <h4>First Name: { firstName }</h4>
        <h4>Last Name: { lastName }</h4>
      </div>
    )
  }
}

export default AccountDetails;
