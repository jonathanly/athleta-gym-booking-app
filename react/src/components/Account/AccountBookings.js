import React from 'react';
import axios from 'axios';
import moment from 'moment';

class AccountBookings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      userBookings: [],
      pastBookings: [],
      futureBookings: []
    }

    this.getUserBookings = this.getUserBookings.bind(this);
    this.sortUserBookings = this.sortUserBookings.bind(this);
  }

  getUserBookings() {
    const id = this.props.currentUser.user._id

    axios.get('/bookings', { params: { id }})
      .then(response => {
        this.setState({ userBookings: response.data })
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
  }

  sortUserBookings() {
    const currentDate = moment().format('L')
    let pastBookings = []
    let futureBookings = []

    const sortPastBookings = this.state.userBookings.map(booking => {
      console.log('hello')
      if (booking.date < currentDate) {
        console.log(currentDate)
        pastBookings.concat(booking)
      }
      this.setState({ pastBookings })
      console.log(pastBookings)
    })

    this.setState({ futureBookings })
  }

  componentWillMount() {
    this.getUserBookings();
    this.sortUserBookings();
  }

  render() {
    const userBookings = (this.state.userBookings).map(booking => {
      return <p key={booking.id}>Class: {booking._trainingSession.title} Date: {booking.date}</p>
    })

    return (
      <div>
        { userBookings }
      </div>
    )
  }
}

export default AccountBookings;
