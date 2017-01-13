import React from 'react';
import TrainingSessionRow from './TrainingSessionRow';

class TrainingSessionTable extends React.Component {
  render() {
    const trainingSessionRows = this.props.trainingSessions.map(trainingSession => {
      return <TrainingSessionRow key={trainingSession._id} trainingSession={trainingSession} />
    })

    return(
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Day</th>
            <th>Time</th>
            <th>Duration</th>
            <th>Capacity</th>
            <th>Date Added</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {trainingSessionRows}
        </tbody>
      </table>
    );
  }
}

export default TrainingSessionTable;
