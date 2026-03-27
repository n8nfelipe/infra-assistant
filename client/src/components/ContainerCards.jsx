import React, { useState, useEffect } from 'react';
import { Box, Play, Square, RotateCcw, Activity, Server } from 'lucide-react';

const ContainerCard = ({ container }) => {
  const isRunning = container.Status?.includes('Up');
  const isSystemContainer = container.Names === 'infrastack' || container.Names === 'infrastack-db';

  return (
    <div className={`container-card glass ${isRunning ? 'running' : 'stopped'}`}>
      <div className="card-top">
        <div className="container-icon">
          <Box size={20} />
        </div>
        <div className={`status-indicator ${isRunning ? 'active' : ''}`} />
      </div>
      
      <div className="card-info">
        <h3>{container.Names}</h3>
        <p className="image-tag">{container.Image}</p>
        <div className="status-text">
            <Activity size={12} />
            <span>{container.Status}</span>
        </div>
      </div>

      {!isSystemContainer && (
        <div className="card-actions">
          {/* Buttons are just visual here as per request for "layout improvement" 
              Real actions would hit the /api/execute endpoint */}
          <button title="Restart" className="action-icon"><RotateCcw size={14} /></button>
          {isRunning ? (
              <button title="Stop" className="action-icon stop"><Square size={14} /></button>
          ) : (
              <button title="Start" className="action-icon start"><Play size={14} /></button>
          )}
        </div>
      )}
    </div>
  );
};

const ContainerList = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const res = await fetch('/api/containers');
        const data = await res.json();
        setContainers(data.containers || []);
      } catch (err) {
        console.error("Failed to fetch containers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
    const interval = setInterval(fetchContainers, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-dashboard">
      <div className="dashboard-header">
        <Server size={18} />
        <h2>Docker Dashboard</h2>
      </div>
      
      {loading && <p>Carregando containers...</p>}
      <div className="container-grid">
        {containers.map((c, i) => (
          <ContainerCard key={i} container={c} />
        ))}
        {!loading && containers.length === 0 && (
            <p className="empty-msg">Nenhum container encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default ContainerList;
