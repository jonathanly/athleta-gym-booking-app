import React from 'react';
import { Button } from 'muicss/react';
import { Link } from 'react-router'

class TrainingSessionRow extends React.Component {
  render() {
    const { trainingSession, onDelete } = this.props;

    return (
      <tr>
        <td>{trainingSession.title}</td>
        <td>{trainingSession.day}</td>
        <td>{trainingSession.time}</td>
        <td>{trainingSession.capacity}</td>
        <td>{trainingSession.duration} mins</td>
        <td>
          <Link to={`/trainingSessions/edit/${trainingSession._id}`}>
            <Button color="primary">
              <i className="fa fa-edit" alt="Edit" aria-hidden="true"/>
            </Button>
          </Link>
        </td>
        <td>
          <Button color="danger" onClick={(e) => onDelete()}>
            <i className="fa fa-trash" alt="Delete" aria-hidden="true"/>
          </Button>
        </td>
      </tr>
    );
  }
}

export default TrainingSessionRow;
