import React from 'react';
import BookingForm from './BookingForm';

class Booking extends React.Component {
  render() {
    return (
      <div>
        <h3>Booking Container</h3>
        <BookingForm currentUser={this.props.currentUser} />
      </div>
    )
  }
}

export default Booking;
