import React from 'react';
import BookingForm from './BookingForm';

class Booking extends React.Component {
  render() {
    return (
      <div>
        <BookingForm currentUser={this.props.currentUser} />
      </div>
    )
  }
}

export default Booking;
