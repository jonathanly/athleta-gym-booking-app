import React from 'react';

class TrainingSessionRow extends React.Component {


  render() {
    const { trainingSession, onDelete } = this.props;

    return (
      <tr>
        <td>{trainingSession.title}</td>
        <td>{trainingSession.day}</td>
        <td>{trainingSession.time}</td>
        <td>{trainingSession.duration} mins</td>
        <td>{trainingSession.capacity}</td>
        <td>{trainingSession.dateAdded}</td>
        <td>{trainingSession.lastUpdated}</td>
        <td>
          <button>
            Update
          </button>
        </td>
        <td>
          <button onClick={(e) => onDelete() }>
            Delete
          </button>
        </td>
      </tr>
    );
  }
}

export default TrainingSessionRow;
