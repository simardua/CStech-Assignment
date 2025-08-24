import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents');
      if (response.data.success) {
        setAgents(response.data.data);
      }
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        const response = await api.delete(`/agents/${agentId}`);
        if (response.data.success) {
          toast.success('Agent deleted successfully!');
          fetchAgents();
        }
      } catch (error) {
        // Error handled by interceptor
      }
    }
  };

  const toggleAgentStatus = async (agentId, currentStatus) => {
    try {
      const response = await api.put(`/agents/${agentId}`, {
        isActive: !currentStatus
      });
      
      if (response.data.success) {
        toast.success('Agent status updated!');
        fetchAgents();
      }
    } catch (error) {
      // Error handled by interceptor
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  if (loading) {
    return <div className="loading">Loading agents...</div>;
  }

  return (
    <div className="agent-list-container">
      <h3>Agents ({agents.length})</h3>
      
      {agents.length === 0 ? (
        <p className="no-data">No agents found. Add some agents to get started.</p>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => (
            <div key={agent._id} className="agent-card">
              <div className="agent-info">
                <h4>{agent.name}</h4>
                <p><strong>Email:</strong> {agent.email}</p>
                <p><strong>Mobile:</strong> {agent.mobile}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`status ${agent.isActive ? 'active' : 'inactive'}`}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              
              <div className="agent-actions">
                <button
                  onClick={() => toggleAgentStatus(agent._id, agent.isActive)}
                  className={`btn ${agent.isActive ? 'btn-warning' : 'btn-success'}`}
                >
                  {agent.isActive ? 'Deactivate' : 'Activate'}
                </button>
                
                <button
                  onClick={() => handleDelete(agent._id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentList;