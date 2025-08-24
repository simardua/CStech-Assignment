import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AgentList from './AgentList';
import AgentForm from './AgentForm';
import FileUpload from './FileUpload';
import DistributionView from './DistributionView';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Agent Management System</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          Agents
        </button>
        <button
          className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Lists
        </button>
        <button
          className={`nav-btn ${activeTab === 'distributions' ? 'active' : ''}`}
          onClick={() => setActiveTab('distributions')}
        >
          View Distributions
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'agents' && (
          <div className="agents-section">
            <AgentForm />
            <AgentList />
          </div>
        )}
        
        {activeTab === 'upload' && <FileUpload />}
        
        {activeTab === 'distributions' && <DistributionView />}
      </main>
    </div>
  );
};

export default Dashboard;