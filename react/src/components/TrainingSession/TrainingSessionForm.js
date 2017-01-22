import React from 'react';
import fetchAPI from '../../api/fetchAPI';
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

    this.state = {
      editTrainingSession: {
        title: '',
        day: '',
        time: '',
        duration: '',
        capacity: ''
      },
      error: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadTrainingSession = this.loadTrainingSession.bind(this);
  }

  loadTrainingSession() {
    const { trainingSessionId } = this.props
    console.log(trainingSessionId)
    fetchAPI(`/trainingSessions/${trainingSessionId}`)
      .then(trainingSession => {
        console.log(trainingSession)
        this.setState({
          editTrainingSession: {
            title: trainingSession.title,
            day: trainingSession.day,
            time: trainingSession.time,
            duration: trainingSession.duration,
            capacity: trainingSession.capacity
          }
        })
      })
      .catch(error => {
        this.setState({ error })
      });
  }

  componentWillMount() {
    if (this.props.trainingSessionId) {
      console.log("loading")
      this.loadTrainingSession();
    }
  }

  handleSubmit(event) {
    const form = event.target
    const { elements } = form
    const {trainingSessionId } = this.props

    const trainingSession = {
      trainingSessionId: trainingSessionId,
      title: elements.title.value,
      day: elements.day.value,
      time: elements.time.value,
      duration: elements.duration.value,
      capacity: elements.capacity.value
    }
    event.preventDefault();
    console.log('Form:', trainingSession)
    this.props.handleSubmit(trainingSession);
    form.reset();
  }

  render() {
    const { editTrainingSession } = this.state
    return (
      <div>
        <h3>{this.props.title}</h3>
        <Panel>
          <Form inline={true} onSubmit={this.handleSubmit}>
            <Row>
              <Col md="4" xs="12">
                <Input label="Class Name" name="title" type="text" value={editTrainingSession.title} required={true} />
              </Col>
              <Col md="2" xs="6">
                <Select label="Day" name="day" value={editTrainingSession.day} required={true}>
                  <Option value="" label="" />
                  { selectDay }
                </Select>
              </Col>
              <Col md="2" xs="6">
                <Select label="Time" name="time" value={editTrainingSession.time} required={true}>
                  <Option value="" label="" />
                  { selectTime }
                </Select>
              </Col>
              <Col md="2" xs="6">
                <Input label="Max Size" name="capacity" value={editTrainingSession.capacity} required={true} />
              </Col>
              <Col md="2" xs="6">
                <Input label="Duration" name="duration" value={editTrainingSession.duration} required={true} />
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
