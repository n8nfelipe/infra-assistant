import React, { useState, useEffect } from "react";
import { History, Terminal, ChevronDown, ChevronUp, X } from "lucide-react";

const HistoryPanel = ({ onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/logs");
                const data = await res.json();
                setLogs(data.logs || []);
            } catch (err) {
                console.error("Failed to fetch logs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatDate = (iso) => {
        return new Date(iso).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="history-panel glass" onClick={(e) => e.stopPropagation()}>
                <div className="history-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <History size={18} />
                        <span>Histórico de Comandos</span>
                    </div>
                    <button className="btn-link" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="history-list">
                    {loading && <p className="history-empty">Carregando...</p>}
                    {!loading && logs.length === 0 && (
                        <p className="history-empty">Nenhum comando registrado ainda.</p>
                    )}
                    {logs.map((log) => (
                        <div key={log.id} className="history-item">
                            <div
                                className="history-item-header"
                                onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                            >
                                <div className="history-item-info">
                                    <span className="history-prompt">{log.prompt}</span>
                                    <span className="history-date">{formatDate(log.executed_at)}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    {log.exit_code !== null && (
                                        <span className={`history-badge ${log.exit_code === 0 ? "success" : "error"}`}>
                                            {log.exit_code === 0 ? "OK" : `Erro ${log.exit_code}`}
                                        </span>
                                    )}
                                    {expanded === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {expanded === log.id && (
                                <div className="history-item-detail">
                                    {log.command && (
                                        <div className="command-text" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                                            $ {log.command}
                                        </div>
                                    )}
                                    {log.explanation && (
                                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                                            {log.explanation}
                                        </p>
                                    )}
                                    {log.output && (
                                        <div className="terminal" style={{ maxHeight: "150px", fontSize: "0.75rem" }}>
                                            {log.output}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HistoryPanel;
