import React from 'react';
import fetchAPI, { postAPI } from '../../api/fetchAPI';
import { Panel, Form, Button, Select, Option } from 'muicss/react';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import 'react-dates/lib/css/_datepicker.css';
import './BookingForm.css';
import _ from 'lodash';

function weekdayIndexForSessionDay(day) {
  switch (day) {
    case "Sun": return 0;
    case "Mon": return 1;
    case "Tue": return 2;
    case "Wed": return 3;
    case "Thu": return 4;
    case "Fri": return 5;
    case "Sat": return 6;
  }
}

class BookingForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedTitle: '',
      filteredSessions: [],
      error: null
    }

    this.onTitleSelect = this.onTitleSelect.bind(this);
    this.createNewBooking = this.createNewBooking.bind(this);
  }

  onTitleSelect(event) {
    const select = event.target
    const { value } = select
    let selectedTitle = value
    this.setState({ selectedTitle })

    event.preventDefault();
    console.log(selectedTitle);
    fetchAPI('/trainingSessions')
      .then(sessions => {
        let filteredSessions = sessions.filter(result => (selectedTitle === result.title))
        this.setState({ filteredSessions: filteredSessions })
      })
      .catch(error => {
        this.setState({ error })
      });
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
    postAPI('/bookings', newBooking)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        this.setState({ error })
      })

  }

  render() {
    // Get array of unique training session titles then create Select Options
    const sessionTitles = _.uniq(this.props.trainingSessions.map(session => { return session.title }));
    const sessionTitleOptions = sessionTitles.map(title => { return <Option key={title} value={title} label={title} /> });
    // onTitleSelect returns training session day and time corresponding to selected training session title
    let filteredSessionsDay = this.state.filteredSessions.map(session => {
      return <Option key={session._id} value={session.day} label={`${session.day}`} />
    });
    // Selected time returns trainingSession_.id to form 
    let filteredSessionsTime = this.state.filteredSessions.map(session => {
      return <Option key={session._id} value={session._id} label={`${session.time}`} />
    });

    const availableWeekdays = _.uniq(this.state.filteredSessions.map(session => (
      weekdayIndexForSessionDay(session.day)
    )))

    return (
      <Panel>
        <h1>Booking Form</h1>
        <Form name='booking' onSubmit={this.createNewBooking}>
          <Select name="title" label="Class" type="text" required={true} onChange={this.onTitleSelect}>
            <Option value="" label="" />
            {sessionTitleOptions}
          </Select>
          <Select name="day" label="Day" type="text" required={true}>
            <Option value="" label="" />
            {filteredSessionsDay}
          </Select>
          <Select name="classId" label="Time" type="text" required={true}>
            <Option value="" label="" />
            {filteredSessionsTime}
          </Select>
          <SingleDatePicker name="date" id="date"
            date={this.state.date}
            focused={this.state.focused}
            numberOfMonths={1}
            required={true}
            isDayBlocked={ (date) => !_.includes(availableWeekdays, moment(date).day()) }
            onDateChange={(date) => { this.setState({ date }); }}
            onFocusChange={({ focused }) => { this.setState({ focused }); }}
          />
          <h1>{"\n"}</h1>
          <Button variant="raised" type="submit" color="primary">
            <i className="fa fa-floppy-o" aria-hidden="true"/> Book
          </Button>
        </Form>
      </Panel>
    )
  }
}

export default BookingForm;
