import React from 'react';
import axios from 'axios';
import fetchAPI from '../../api/fetchAPI';
import { Form, Select, Option, Button, Col } from 'muicss/react';
import _ from 'lodash';

class SearchTrainingSession extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      titleOptions: [],
      dayOptions: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      timeOptions: ["6:00AM", "8:30AM", "9:30AM", "10:00AM", "5:30PM", "6:00PM", "6:30PM", "7:00PM", "7:30PM"],
      selectedTitle: '',
      selectedDay: '',
      selectedTime: ''
    }

    this.getTitles = this.getTitles.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onDayChange = this.onDayChange.bind(this);
    this.onTimeChange = this.onTimeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearForm = this.clearForm.bind(this);
  }

  getTitles() {
    axios.get('/trainingSessions')
      .then(trainingSessions => {
        // return array of unique trainingSession.titles to state
        let titleOptions = _.uniq(trainingSessions.data.map(session => {return session.title}));
        this.setState({ titleOptions });
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  onTitleChange(event) {
    this.setState({selectedTitle: event.target.value})
  }

  onDayChange(event) {
    this.setState({selectedDay: event.target.value})
  }

  onTimeChange(event) {
    this.setState({selectedTime: event.target.value})
  }

  handleSubmit(event) {
    let { selectedTitle, selectedDay, selectedTime } = this.state;
    event.preventDefault();
    this.props.loadTrainingSessions({
      title: selectedTitle,
      day: selectedDay,
      time: selectedTime
    });
  }

  clearForm(event) {
    const clear = {
      selectedTitle: '',
      selectedDay: '',
      selectedTime: ''
    }
    event.preventDefault();
    this.props.loadTrainingSessions(clear)
    this.setState(clear)
  }

  componentWillMount() {
    this.getTitles();
  }

  render() {
    const titleOptions = this.state.titleOptions.map(title => {
      return <Option key={title} value={title} label={title} />
    })

    const dayOptions = this.state.dayOptions.map(day => {
      return <Option key={day} value={day} label={day} />
    })

    const timeOptions = this.state.timeOptions.map(time => {
      return <Option key={time} value={time} label={time} />
    })

    return (
      <div>
        <Form inline={true} onSubmit={this.handleSubmit}>
          <Col md="4" xs="12">
            <Select label="Class Name" value={this.state.selectedTitle} onChange={this.onTitleChange}>
              <Option value="" label="" />
              { titleOptions }
            </Select>
          </Col>
          <Col md="4" xs="12">
            <Select label="Day" value={this.state.selectedDay} onChange={this.onDayChange}>
              <Option value="" label="" />
              { dayOptions }
            </Select>
          </Col>
          <Col md="4" xs="12">
            <Select label="Time" value={this.state.selectedTime} onChange={this.onTimeChange}>
              <Option value="" label="" />
              { timeOptions }
            </Select>
          </Col>
          <Button variant="raised" type="submit" color="primary">Search</Button>
        </Form>
        <Button variant="raised" type="submit" color="danger" onClick={this.clearForm}>Clear</Button>
      </div>
    )
  }
}

export default SearchTrainingSession;
