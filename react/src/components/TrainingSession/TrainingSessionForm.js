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
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    event.preventDefault();
    const form = document.forms.trainingSession
    let trainingSession = {
      title: form.title.value,
      day: form.day.value,
      time: form.time.value,
      capacity: form.capacity.value,
      duration: form.duration.value
    }
    this.props.handleUserInput(trainingSession);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.handleSubmit();
  }

  render() {
    let { trainingSession } = this.props

    return (
      <div>
        <h3>{this.props.title}</h3>
        <Panel>
          <Form name="trainingSession" inline={true} onSubmit={this.handleSubmit}>
            <Row>
              <Col md="4" xs="12">
                <Input label="Class Name" name="title" type="text" required={true} value={trainingSession.title} onChange={this.handleChange}/>
              </Col>
              <Col md="2" xs="6">
                <Select label="Day" name="day" required={true} value={trainingSession.day} onChange={this.handleChange}>
                  <Option value="" label="" />
                  { selectDay }
                </Select>
              </Col>
              <Col md="2" xs="6">
                <Select label="Time" name="time" required={true} value={trainingSession.time} onChange={this.handleChange}>
                  <Option value="" label="" />
                  { selectTime }
                </Select>
              </Col>
              <Col md="2" xs="6">
                <Input label="Max Size" name="capacity" required={true} value={trainingSession.capacity} onChange={this.handleChange} />
              </Col>
              <Col md="2" xs="6">
                <Input label="Duration" name="duration" required={true} value={trainingSession.duration} onChange={this.handleChange} />
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

// handleSubmit(event) {
//   const form = event.target
//   const { elements } = form
//   const {trainingSessionId } = this.props
//
//   const trainingSession = {
//     trainingSessionId: trainingSessionId,
//     title: elements.title.value,
//     day: elements.day.value,
//     time: elements.time.value,
//     duration: elements.duration.value,
//     capacity: elements.capacity.value
//   }
//   event.preventDefault();
//   console.log('Form:', trainingSession)
//   this.props.handleSubmit(trainingSession);
//   form.reset();
// }
