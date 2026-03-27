import React, { useState, useEffect } from 'react';
import { Box, Play, Square, RotateCcw, Activity, Server } from 'lucide-react';

const ContainerCard = ({ container }) => {
  const isRunning = container.Status?.includes('Up');
  const isSystemContainer = container.Names === 'infrastack' || container.Names === 'infrastack-db';

  return (
    <div className={`container-card glass line-layout ${isRunning ? 'running' : 'stopped'}`}>
      <div className="container-icon-small">
        <Box size={16} />
      </div>
      
      <div className="card-info-compact">
        <div className="name-status">
            <h3>{container.Names}</h3>
            <div className={`status-dot ${isRunning ? 'active' : ''}`} />
        </div>
        <p className="image-tag-compact">{container.Image}</p>
      </div>

      {!isSystemContainer && (
        <div className="card-actions-compact">
          <button title="Restart" className="action-icon-small"><RotateCcw size={12} /></button>
          {isRunning ? (
              <button title="Stop" className="action-icon-small stop"><Square size={12} /></button>
          ) : (
              <button title="Start" className="action-icon-small start"><Play size={12} /></button>
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
