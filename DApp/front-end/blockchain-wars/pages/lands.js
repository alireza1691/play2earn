import React, { useState } from 'react'
import LandsComponent from '../components/LandsComponent'

const lands = () => {

    // const[lands, setLands] = useState([{coordinateX:"",coordinateY:""}])
    // const lands = [];
    const lands = [];
    function fillLands() {
        let counter = 0
        for (let x = 100; x < 110; x++) {
            for (let y = 100; y < 110; y++) {
                const land = {id: counter, x: x, y: y, color: "green"};
                counter++
                lands.push(land)
            }
           
            
        }
    }
    fillLands()
    // for (let x = 100; x <= 999; x++) {
    //   for (let y = 100; y <= 999; y++) {
    //     const landKey = `${x}-${y}`;
    //     const landStyle = {
    //       position: 'absolute',
    //       left: `${x}px`,
    //       top: `${y}px`,
    //       width: '10px',
    //       height: '10px',
    //       backgroundColor: 'green',
    //       border: '1px solid black',
    //     };
  
    //     lands.push(
    //       <div key={landKey} style={landStyle}></div>
    //     );
    //   }
    // }
  

  return (
    <div style={{"display":"flex","justifyContent":"center"}}>
        <div className='landGrid'>
            {lands.map((land) => (
                <div className='item' key={land.id}>

                </div>
            ))}

        </div>
    {/* <div style={{ position: 'relative' }}>
      {lands.map((land) => (
        <div
          key={land.id}
          style={{
            position: 'absolute',
            left: `${land.x*10}px`,
            top: `${land.y*10}px`,
            width: '10px',
            height: '10px',
            backgroundColor: land.color,
            border: '1px solid black',
          }}
        ></div>
      ))}
    </div> */}
      {/* <LandsComponent/> */}
    </div>
  )
}

export default lands

