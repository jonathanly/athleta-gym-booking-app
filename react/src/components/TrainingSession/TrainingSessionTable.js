import React from 'react';
import TrainingSessionRow from './TrainingSessionRow';
import { Panel, Col, Row } from 'muicss/react';

// Styling
let s1 = { textAlign: "center" };

class TrainingSessionTable extends React.Component {
  render() {
    const trainingSessionRows = this.props.trainingSessions.map(trainingSession => {
      return <TrainingSessionRow key={trainingSession._id}
        trainingSession={trainingSession}
        onDelete={() => this.props.deleteTrainingSession(trainingSession._id)}
      />
    })

    return(
      <Panel>
        <table className="mui-table mui-table-bordered" id="training-session-table">
          <thead>
            <tr>
              <th style={s1}>Title</th>
              <th style={s1}>Day</th>
              <th style={s1}>Time</th>
              <th style={s1}>Capacity</th>
              <th style={s1}>Duration</th>
              <th style={s1}>Date Added</th>
              <th style={s1}>Last Updated</th>
              <th style={s1}></th>
              <th style={s1}></th>
            </tr>
          </thead>
          <tbody>
            {trainingSessionRows}
          </tbody>
        </table>
      </Panel>
    );
  }
}

export default TrainingSessionTable;
