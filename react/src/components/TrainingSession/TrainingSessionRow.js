import React from 'react';
import { Button, Col, Row } from 'muicss/react';

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
        <td>{trainingSession.dateAdded}</td>
        <td>{trainingSession.lastUpdated}</td>
        <td>
          <Button color="primary">
            <i className="fa fa-pencil" aria-hidden="true"/>
          </Button>
        </td>
        <td>
          <Button color="danger" onClick={(e) => onDelete()}>
            <i className="fa fa-trash" aria-hidden="true"/>
          </Button>
        </td>
      </tr>
    );
  }
}

export default TrainingSessionRow;
