import React from 'react'

const styles = {
  img: { height: '50vh' }
}

const NotFound = (props) => {
  return (
    <div>
      <h2 style={{fontFamily: 'Comic Sans MS'}}>
        <strong>Page cannot be found</strong>
      </h2>
      <img src={require('../../images/doge.jpg')} style={styles.img}/>
      <h3 style={{fontFamily: 'Comic Sans MS', color: '#00ff00'}}>
        Wow how skill
      </h3>
      <h3 style={{fontFamily: 'Comic Sans MS', color: '#ff00ff'}}>
        Much programming
      </h3>
      <h3 style={{fontFamily: 'Comic Sans MS', color: '#ff0000'}}>
        Such intelligent
      </h3>
      <h3>\_(ツ)_/¯</h3>
    </div>
  )
}


export default NotFound;
