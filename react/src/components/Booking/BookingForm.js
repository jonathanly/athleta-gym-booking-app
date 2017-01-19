import React from 'react';
import fetchAPI from '../../api/fetchAPI';
import { Panel, Form, Button, Select, Option } from 'muicss/react';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import './BookingForm.css';
var _ = require('lodash/array');

class BookingForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedTitle: '',
      filteredSessions: [],
      error: null
    }

    this.onTitleSelect = this.onTitleSelect.bind(this);
  }

  onTitleSelect(e) {
    const select = e.target
    const { value } = select
    let selectedTitle = value
    this.setState({ selectedTitle })

    e.preventDefault();
    console.log(selectedTitle);
    fetchAPI('/trainingSessions')
      .then(sessions => {
        let filteredSessions = sessions.filter(result => (selectedTitle === result.title))
        this.setState({ filteredSessions: filteredSessions })
      })
      .catch(err => {
        this.setState({ error: err })
      });
  }

  render() {
    // Get array of unique training session titles then create Select Options
    const sessionTitles = _.uniq(this.props.trainingSessions.map(session => { return session.title }));
    const sessionTitleOptions = sessionTitles.map(title => { return <Option key={title} value={title} label={title} /> });
    // onTitleSelect returns training session day and time corresponding to selected training session title
    let filteredSessionsOptions = this.state.filteredSessions.map(session => {
      return <Option key={session._id} value={session._id} label={`${session.day} ${session.time}`} />
    });

    return (
      <Panel>
        <h1>Booking Form</h1>
        <Form name='booking'>
          <Select name="title" onChange={this.onTitleSelect}>
            <Option value="" label="" />
            {sessionTitleOptions}
          </Select>
          <Select name="classId">
            <Option value="" label="" />
            {filteredSessionsOptions}
          </Select>
          <SingleDatePicker id="date_input"
            date={this.state.date}
            focused={this.state.focused}
            numberOfMonths={1}
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

// const options = this.props.trainingSessions.map(trainingSession => {
//   return <Option key={trainingSession._id}
//     value={trainingSession._id}
//     label={`${trainingSession.title} ${trainingSession.day} ${trainingSession.time}`}
//   />
// });
