import React from 'react';

const LandsComponent = () => {
  const renderLands = () => {
    const lands = [];
    for (let x = 100; x <= 200; x++) {
      for (let y = 100; y <= 200; y++) {
        const landKey = `${x}-${y}`;
        const landStyle = {
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: '20px',
          height: '20px',
          backgroundColor: 'green',
          border: '1px solid black',
        };

        lands.push(
          <div key={landKey} style={landStyle}></div>
        );
      }
    }
    return lands;
  };

  return (
    <div style={{ position: 'relative' ,width:"100%"}}>
      {renderLands()}
    </div>
  );
};

export default LandsComponent;