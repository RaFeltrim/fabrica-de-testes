import React, { useState } from 'react';
import './PipelineControls.css';

const PipelineControls = ({ onPipelineRun }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineOptions, setPipelineOptions] = useState({
    environment: 'production',
    branch: 'main',
    parallel: 5
  });

  const handleTriggerPipeline = (pipeline) => {
    setSelectedPipeline(pipeline);
    setIsModalOpen(true);
  };

  const confirmTrigger = () => {
    setIsModalOpen(false);
    setIsRunning(true);
    
    // Notify parent component that pipeline is running
    if (onPipelineRun) {
      onPipelineRun({
        timestamp: new Date(),
        status: 'running'
      });
    }
    
    // Simulate pipeline execution
    setTimeout(() => {
      setIsRunning(false);
      alert(`✅ Pipeline "${selectedPipeline}" completed successfully!

Environment: ${pipelineOptions.environment}
Branch: ${pipelineOptions.branch}
Parallel jobs: ${pipelineOptions.parallel}

Check the dashboard for updated results.`);
      
      // Notify parent component that pipeline completed
      if (onPipelineRun) {
        onPipelineRun({
          timestamp: new Date(),
          status: 'success'
        });
      }
    }, 3000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPipeline('');
  };

  const handleOptionChange = (option, value) => {
    setPipelineOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  return (
    <>
      <div className="pipeline-controls">
        <button 
          className="pipeline-btn trigger" 
          onClick={() => handleTriggerPipeline('Full Regression Test')}
          disabled={isRunning}
        >
          {isRunning ? '⏳ Running Pipeline...' : '🚀 Trigger Pipeline'}
        </button>
        <button 
          className="pipeline-btn rerun" 
          onClick={() => handleTriggerPipeline('Rerun Failed Tests')}
          disabled={isRunning}
        >
          {isRunning ? '⏳ Running Pipeline...' : '🔄 Rerun Failed Tests'}
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Pipeline Execution</h3>
            <p>Are you sure you want to run <strong>"{selectedPipeline}"</strong>?</p>
            
            <div className="pipeline-options">
              <div className="option-group">
                <label>Environment:</label>
                <select 
                  value={pipelineOptions.environment}
                  onChange={(e) => handleOptionChange('environment', e.target.value)}
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Branch:</label>
                <input 
                  type="text" 
                  value={pipelineOptions.branch}
                  onChange={(e) => handleOptionChange('branch', e.target.value)}
                />
              </div>
              
              <div className="option-group">
                <label>Parallel Jobs:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20"
                  value={pipelineOptions.parallel}
                  onChange={(e) => handleOptionChange('parallel', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-confirm" onClick={confirmTrigger}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PipelineControls;
