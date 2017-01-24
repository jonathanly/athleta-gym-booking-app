import React from 'react';
import fetchAPI from '../../api/fetchAPI';
import { Form, Select, Option, Button } from 'muicss/react';
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
  }

  getTitles() {
    fetchAPI('/trainingSessions')
      .then(trainingSessions => {
        let titleOptions = _.uniq(trainingSessions.map(session => {return session.title}));
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
    console.log(selectedTitle);
    event.preventDefault();
    this.props.loadTrainingSessions({
      title: selectedTitle,
      day: selectedDay,
      time: selectedTime
    });
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
          <Select label="Class Name" value={this.state.selectedTitle} onChange={this.onTitleChange}>
            <Option value="" label="" />
            { titleOptions }
          </Select>
          <Select label="Day" value={this.state.selectedDay} onChange={this.onDayChange}>
            <Option value="" label="" />
            { dayOptions }
          </Select>
          <Select label="Time" value={this.state.selectedTime} onChange={this.onTimeChange}>
            <Option value="" label="" />
            { timeOptions }
          </Select>
          <Button variant="raised" type="submit" color="primary">Search</Button>
        </Form>
      </div>
    )
  }
}

export default SearchTrainingSession;
