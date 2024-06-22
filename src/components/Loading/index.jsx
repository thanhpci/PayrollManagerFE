import React from 'react';
import { Spin } from 'antd';
import './styles.css';

const Loading = ({ isLoading }) => {
  return (
    isLoading ? (
      <div className="loading-overlay">
        <Spin size="large" />
      </div>
    ) : null
  );
};

export default Loading;