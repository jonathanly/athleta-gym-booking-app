import React from 'react';
import TrainingSessionRow from './TrainingSessionRow';
import { Panel } from 'muicss/react';

let style = { textAlign: "center" };

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
        <table className="mui-table mui-table-bordered">
          <thead>
            <tr>
              <th style={style}>Title</th>
              <th style={style}>Day</th>
              <th style={style}>Time</th>
              <th style={style}>Duration</th>
              <th style={style}>Capacity</th>
              <th style={style}>Date Added</th>
              <th style={style}>Last Updated</th>
              <th style={style}></th>
              <th style={style}></th>
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
