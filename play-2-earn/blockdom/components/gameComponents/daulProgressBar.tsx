import React from 'react';
import './DualProgressBar.css'; // Add your own styles

interface DualProgressBarProps {

  currentLevel: number
}

const DualProgressBar: React.FC<DualProgressBarProps> = ({  currentLevel }) => {
  const calculateWidth = (level: number) => {
    // return `${value}%`;
    return `${level*100/6}%`;
  };

  return (
    <div className="dual-progress-bar">
      <div className="progress-bar" style={{ width: calculateWidth(currentLevel+1) }} />
      <div className="progress-bar secondary" style={{ width: calculateWidth(currentLevel) }} />
    </div>
  );
};

export default DualProgressBar;
