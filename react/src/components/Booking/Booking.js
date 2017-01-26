import React from 'react';
import BookingForm from './BookingForm';

class Booking extends React.Component {
  render() {
    return (
      <div>
        <h3>This is where bookings will go</h3>
        <BookingForm currentUser={this.props.currentUser} />
      </div>
    )
  }
}

export default Booking;
