import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const allowedTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Invalid file type. Please upload CSV, XLSX, or XLS files only.');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB.');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('File uploaded and distributed successfully!');
        setUploadResult(response.data.data);
        setFile(null);
        document.getElementById('file-input').value = '';
      }
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <h3>Upload and Distribute Lists</h3>
      
      <div className="upload-info">
        <h4>File Requirements:</h4>
        <ul>
          <li>Supported formats: CSV, XLSX, XLS</li>
          <li>Maximum file size: 10MB</li>
          <li>Required columns: FirstName, Phone, Notes</li>
          <li>Files will be automatically distributed among active agents</li>
        </ul>
      </div>

      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="file-input">Select File</label>
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            required
          />
        </div>
        
        {file && (
          <div className="file-info">
            <p><strong>Selected file:</strong> {file.name}</p>
            <p><strong>File size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !file}
        >
          {loading ? 'Processing...' : 'Upload and Distribute'}
        </button>
      </form>

      {uploadResult && (
        <div className="upload-result">
          <h4>Distribution Summary</h4>
          <div className="result-info">
            <p><strong>Total Records:</strong> {uploadResult.totalRecords}</p>
            <p><strong>Active Agents:</strong> {uploadResult.agentCount}</p>
          </div>
          
          <div className="distribution-summary">
            <h5>Records per Agent:</h5>
            {uploadResult.distributions.map((dist, index) => (
              <div key={index} className="distribution-item">
                <span>{dist.agentName}: {dist.recordCount} records</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;