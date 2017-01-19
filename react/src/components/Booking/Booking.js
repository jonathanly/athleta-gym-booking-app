import React from 'react';
import fetchAPI from '../../api/fetchAPI';
import BookingForm from './BookingForm';

class Booking extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      trainingSessions: [],
      error: null
    };

  this.getTrainingSessions = this.getTrainingSessions.bind(this);
  }

  getTrainingSessions() {
    fetchAPI('/trainingSessions')
    .then(res => {
      this.setState({
        trainingSessions: res
      });
    })
    .catch(err => {
      this.setState({ error: err })
    });
  }

  componentWillMount() {
    this.getTrainingSessions();
  }

  render() {
    return (
      <div>
        <h1>This is where bookings will go</h1>
        <BookingForm trainingSessions={this.state.trainingSessions} currentUser={this.props.currentUser} />
      </div>
    )
  }
}

export default Booking;
