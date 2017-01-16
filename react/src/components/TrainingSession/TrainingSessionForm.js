import React from 'react';

class TrainingSessionForm extends React.Component {
  createTrainingSession(e) {
    const newTrainingSession = {
      title: this.title.value,
      day: this.day.value,
      time: this.time.value,
      duration: this.duration.value,
      capacity: this.capacity.value
    }
  
    e.preventDefault();
    console.log('Adding training session...');
    this.props.addTrainingSession(newTrainingSession);
    this.trainingSessionForm.reset();

  }

  render() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const times = ["0600", "0830", "0930", "1000", "1730", "1800", "1830", "1900", "1930"]
    const selectDay = days.map(day => (
      <option key={day}>{day}</option>
    ));
    const selectTime = times.map(time => (
      <option key={time}>{time}</option>
    ));

    return (
      <form ref={(input) => this.trainingSessionForm = input} onSubmit={(e) => this.createTrainingSession(e)}>
        <input ref={(input) => this.title = input} type="text" placeholder="Title"/>
        <select ref={(input) => this.day = input}>
          { selectDay }
        </select>
        <select ref={(input) => this.time = input}>
          { selectTime }
        </select>
        <input ref={(input) => this.capacity = input} type="text" placeholder="Max Capacity"/>
        <input ref={(input) => this.duration = input} type="text" placeholder="Duration"/>
        <button type="submit">Submit</button>
      </form>
    )
  }
}

export default TrainingSessionForm;
