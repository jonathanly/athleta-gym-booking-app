import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { Panel } from 'muicss/react'

// Styling
let s1 = { textAlign: "center" };

class AccountBookings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      userBookings: [],
    }

    this.getUserBookings = this.getUserBookings.bind(this);
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

  componentWillMount() {
    this.getUserBookings();
  }

  render() {
    const userBookings = (this.state.userBookings).map((booking, i) => {
      return (
        <tr key={i}>
          <td>{booking._trainingSession.title}</td>
          <td>{booking.date}</td>
          <td>{booking._trainingSession.time}</td>
        </tr>
      )
    })

    return (
      <Panel>
        <table className="mui-table mui-table-bordered">
          <thead>
            <tr>
              <th style={s1}>Class</th>
              <th style={s1}>Date</th>
              <th style={s1}>Time</th>
            </tr>
          </thead>
          <tbody>
            {userBookings}
          </tbody>
        </table>
      </Panel>
    )
  }
}

export default AccountBookings;
