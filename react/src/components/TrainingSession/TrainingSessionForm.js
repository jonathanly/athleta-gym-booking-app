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
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    const form = event.target
    const { elements } = form

    const trainingSession = {
      title: elements.title.value,
      day: elements.day.value,
      time: elements.time.value,
      duration: elements.duration.value,
      capacity: elements.capacity.value
    }
    event.preventDefault();
    this.props.handleSubmit(trainingSession);
    form.reset();
  }

  // check form validation

  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <Panel>
          <Form inline={true} onSubmit={this.handleSubmit}>
            <Row>
              <Col md="4" xs="12">
                <Input label="Class Name" name="title" type="text" required={true} />
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
                <Input label="Max Size" name="capacity" type="tel" required={true} />
              </Col>
              <Col md="2" xs="6">
                <Input label="Duration" name="duration" required={true} />
              </Col>
            </Row>
            <Button variant="raised" type="submit" color="primary">
              <i className="fa fa-floppy-o" aria-hidden="true"/> Submit
            </Button>
          </Form>
        </Panel>
      </div>
    )
  }
}

export default TrainingSessionForm;

//
// createTrainingSession(event) {
//   const form = event.target
//   const { elements } = form
//
//   const newTrainingSession = {
//     title: elements.title.value,
//     day: elements.day.value,
//     time: elements.time.value,
//     duration: elements.duration.value,
//     capacity: elements.capacity.value
//   }
//
//   event.preventDefault();
//   console.log('Adding training session...');
//   this.props.addTrainingSession(newTrainingSession);
//   form.reset();
// }
