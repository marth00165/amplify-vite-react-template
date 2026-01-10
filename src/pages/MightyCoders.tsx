import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MightyCoders = () => {
  const [number, setNumber] = useState(0);
  return (
    <div
      style={{
        color: 'white',
        marginTop: '250px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {number}
    </div>
  );
};

MightyCoders.propTypes = {};

export default MightyCoders;
