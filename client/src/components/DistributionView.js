import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const DistributionView = () => {
  const [distributions, setDistributions] = useState([]);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchDistributions = async () => {
    try {
      const response = await api.get('/lists');
      if (response.data.success) {
        setDistributions(response.data.data);
      }
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributionDetails = async (distributionId) => {
    setDetailsLoading(true);
    try {
      const response = await api.get(`/lists/${distributionId}`);
      if (response.data.success) {
        setSelectedDistribution(response.data.data);
      }
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading distributions...</div>;
  }

  return (
    <div className="distribution-view-container">
      <h3>Distribution History</h3>
      
      {distributions.length === 0 ? (
        <p className="no-data">No distributions found. Upload a file to create distributions.</p>
      ) : (
        <div className="distributions-layout">
          <div className="distributions-list">
            <h4>All Distributions</h4>
            {distributions.map((dist) => (
              <div 
                key={dist._id} 
                className={`distribution-item ${selectedDistribution?._id === dist._id ? 'selected' : ''}`}
                onClick={() => fetchDistributionDetails(dist._id)}
              >
                <div className="distribution-header">
                  <strong>{dist.fileName}</strong>
                  <span className="upload-date">{formatDate(dist.uploadDate)}</span>
                </div>
                <div className="distribution-stats">
                  <span>Total Records: {dist.totalRecords}</span>
                  <span>Agents: {dist.distributions.length}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="distribution-details">
            {selectedDistribution ? (
              detailsLoading ? (
                <div className="loading">Loading details...</div>
              ) : (
                <div className="details-content">
                  <h4>Distribution Details</h4>
                  <div className="details-header">
                    <p><strong>File:</strong> {selectedDistribution.fileName}</p>
                    <p><strong>Upload Date:</strong> {formatDate(selectedDistribution.uploadDate)}</p>
                    <p><strong>Total Records:</strong> {selectedDistribution.totalRecords}</p>
                  </div>
                  
                  <div className="agent-distributions">
                    <h5>Agent Assignments</h5>
                    {selectedDistribution.distributions.map((agentDist, index) => (
                      <div key={index} className="agent-distribution">
                        <div className="agent-header">
                          <h6>{agentDist.agentName}</h6>
                          <span className="record-count">{agentDist.recordCount} records</span>
                        </div>
                        
                        <div className="records-list">
                          {agentDist.records.slice(0, 5).map((record, recordIndex) => (
                            <div key={recordIndex} className="record-item">
                              <span><strong>Name:</strong> {record.firstName || 'N/A'}</span>
                              <span><strong>Phone:</strong> {record.phone || 'N/A'}</span>
                              <span><strong>Notes:</strong> {record.notes || 'N/A'}</span>
                            </div>
                          ))}
                          
                          {agentDist.records.length > 5 && (
                            <div className="more-records">
                              ... and {agentDist.records.length - 5} more records
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="no-selection">
                <p>Select a distribution from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionView;