import React from 'react';
import { Button, Form, Input, Select, Option, Panel, Row, Col } from 'muicss/react';

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
      <div>
        <h3>Add Training Session</h3>
        <Panel>
          <Form inline={true} name="trainingSession">
            <Row>
              <Col md="4" xs="12">
                <Input label="Class Name" name="title" required={true} />
              </Col>
              <Col md="2" xs="6">
                <Select label="Day" name="day" required={true}>
                  <Option value="" label="" />
                  { selectDay }
                </Select>
              </Col>
              <Col md="2" xs="6">
                <Select label="Time" name="time" required={true}>
                  <Option value="" label="" />
                  { selectTime }
                </Select>
              </Col>
              <Col md="2" xs="6">
                <Input label="Max Size" name="capacity" />
              </Col>
              <Col md="2" xs="6">
                <Input label="Duration" name="duration" />
              </Col>
            </Row>
          </Form>
          <Button variant="raised" color="primary" onClick={(e) => this.createTrainingSession(e)}>
            <i className="fa fa-floppy-o" aria-hidden="true"/> Submit
          </Button>
        </Panel>
      </div>
    )
  }
}

export default TrainingSessionForm;
