import React from 'react';

// Material UI styling
import { Button, Form, Input, Select, Option, Panel } from 'muicss/react';

// Pre-rendered elements
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const times = ["6:00AM", "8:30AM", "9:30AM", "10:00AM", "5:30PM", "6:00PM", "6:30PM", "7:00PM", "7:30PM"]
const selectDay = days.map(day => (
  <Option key={day} value={day} label={day} />
));
const selectTime = times.map(time => (
  <Option key={time} value={time} label={time} />
));

class TrainingSessionForm extends React.Component {
  createTrainingSession(event) {
    const form = document.forms.trainingSession
    const newTrainingSession = {
      title: form.title.value,
      day: form.day.value,
      time: form.time.value,
      duration: form.duration.value,
      capacity: form.capacity.value
    }

    event.preventDefault();
    console.log('Adding training session...');
    this.props.addTrainingSession(newTrainingSession);
    form.reset();
  }

  render() {
    return (
      <Panel>
        <h3>Add Training Session</h3>
        <Form inline={true} name="trainingSession">
          <Input label="Class Name" name="title" required={true} />
          <Select label="Day" name="day" required={true}>
            <Option value="" label="" />
            { selectDay }
          </Select>
          <Select label="Time" name="time" required={true}>
            <Option value="" label="" />
            { selectTime }
          </Select>
          <Input label="Max Size" name="capacity" />
          <Input label="Duration" name="duration" />
        </Form>
        <Button variant="raised" color="primary" onClick={(e) => this.createTrainingSession(e)}>Submit</Button>
      </Panel>
    )
  }
}

export default TrainingSessionForm;
