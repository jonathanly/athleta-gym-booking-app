import React from 'react';

class TrainingSessionRow extends React.Component {
  render() {
    const { trainingSession } = this.props;

    return (
      <tr>
        <td>{trainingSession.title}</td>
        <td>{trainingSession.day}</td>
        <td>{trainingSession.time}</td>
        <td>{trainingSession.duration}</td>
        <td>{trainingSession.capacity}</td>
        <td>{trainingSession.dateAdded}</td>
        <td>{trainingSession.lastUpdated}</td>
      </tr>
    );
  }
}

export default TrainingSessionRow;
