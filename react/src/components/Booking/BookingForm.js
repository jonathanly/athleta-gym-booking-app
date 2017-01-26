import React from 'react';
import axios from 'axios';
import { Panel, Form, Button, Select, Option } from 'muicss/react';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import 'react-dates/lib/css/_datepicker.css';
import './BookingForm.css';
import _ from 'lodash';

class BookingForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      allTrainingSessions: [],
      filteredSessions: [],
      filteredTimes: [],
      selectedTime: '',
      error: null
    }

    this.getTrainingSessions = this.getTrainingSessions.bind(this);
    this.onTitleSelect = this.onTitleSelect.bind(this);
    this.onDateSelect = this.onDateSelect.bind(this);
    this.createNewBooking = this.createNewBooking.bind(this);
  }

  // Load all trainingSessions
  getTrainingSessions() {
    axios.get('/trainingSessions')
    .then(response => {
      this.setState({ allTrainingSessions: response.data });
    })
    .catch(error => {
      this.setState({ error })
    });
  }

  componentWillMount() {
    this.getTrainingSessions();
  }

  onTitleSelect(event) {
    const selectedTitle = event.target.value
    // Returns array of trainingSession objects with matching titles
    let filteredSessions = (this.state.allTrainingSessions).filter(result => (selectedTitle === result.title))
    this.setState({ filteredSessions })
  }

  onDateSelect() {
    const date = document.forms.booking.date.value
    // Convert selected date to name of day of the week (eg. 'Monday')
    let selectedDay = moment(date).format('dddd');
    // Filter to return training session times corresponding to selected day
    let filteredTimes = (this.state.filteredSessions).filter(result => (selectedDay === result.day))
    // Clear selectedTime on form if another date is chosen
    this.setState({
      filteredTimes: filteredTimes,
      selectedTime: ''
    })
  }


  createNewBooking(event) {
    event.preventDefault();
    console.log(`User id: ${this.props.currentUser.user}`)
    const form = event.target
    const { elements } = form

    const newBooking = {
      date: elements.date.value,
      _trainingSession: elements.classId.value,
      _users: this.props.currentUser.user
    }

    console.log(newBooking);
    axios.post('/bookings', newBooking)
      .then(response => {
        console.log(response.data)
      })
      .catch(error => {
        this.setState({ error })
      })

  }

  render() {
    // Returns array of unique training session titles
    const uniqueSessionTitles = _.uniq(this.state.allTrainingSessions.map(session => { return session.title }));
    // Create a select Option for each unique title
    const titleOptions = uniqueSessionTitles.map(title => { return <Option key={title} value={title} label={title} /> });
    // Returns all available days for selected training session
    const availableWeekdays = _.uniq(this.state.filteredSessions.map(session => { return session.day }))
    // Selected time returns trainingSession_.id to form
    let timeOptions = this.state.filteredTimes.map(session => {
      return <Option key={session._id} value={session._id} label={`${session.time}`} />
    });

    return (
      <Panel>
        <h3>Booking Form</h3>
        <Form name='booking' onSubmit={this.createNewBooking}>
          <Select name="title" label="Class" type="text" required={true} onChange={this.onTitleSelect}>
            <Option value="" label="" />
            {titleOptions}
          </Select>
          <SingleDatePicker name="date" id="date"
            date={this.state.date}
            focused={this.state.focused}
            numberOfMonths={1}
            required={true}
            isDayBlocked={(date) => !_.includes(availableWeekdays, moment(date).format('dddd'))}
            onDateChange={(date) => { this.setState({ date, selectedTime: '' }); }}
            onFocusChange={({ focused }) => { this.setState({ focused }) }}
          />
          <Select name="classId" label="Time" type="text" required={true} value={this.state.selectedTime} onClick={this.onDateSelect}>
            <Option value="" label="" />
            {timeOptions}
          </Select>
          <h1>{"\n"}</h1>
          <Button variant="raised" type="submit" color="primary">
            <i className="fa fa-floppy-o" aria-hidden="true"/> Book
          </Button>
        </Form>
        { availableWeekdays }
      </Panel>
    )
  }
}

export default BookingForm;
