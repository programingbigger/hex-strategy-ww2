import React from 'react';
import { TestRunner } from './components/test/TestRunner';

const TestApp: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <TestRunner />
    </div>
  );
};

export default TestApp;