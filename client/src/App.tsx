import React from 'react';
import { ScholarshipSearchForm } from './frontend-refactor/ScholarshipSearchForm.js';
import { ErrorBoundary } from './frontend-refactor/ErrorBoundary.js';

function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
        <ScholarshipSearchForm />
      </ErrorBoundary>
    </div>
  );
}

export default App;
