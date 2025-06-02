import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import PredictionDashboard from './components/PredictionDashboard';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <PredictionDashboard />
      </Layout>
    </ThemeProvider>
  );
}

export default App;