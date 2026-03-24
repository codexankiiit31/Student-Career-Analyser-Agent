import React, { useState, useEffect, useRef } from 'react';
import './LiveTerminal.css';

const LiveTerminal = () => {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('connecting'); // connecting, open, closed
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    // Get the base WS URL from the HTTP API URL
    const getWsUrl = () => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
        return apiUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/logs';
    };

    useEffect(() => {
        // Initialize WebSocket
        const wsUrl = getWsUrl();
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
            setStatus('open');
            setLogs(prev => [...prev, { text: 'System Online. Awaiting Agent Instructions...', type: 'system' }]);
        };

        socketRef.current.onmessage = (event) => {
            const message = event.data;
            setLogs(prev => [...prev, { text: message, type: 'log' }]);
        };

        socketRef.current.onclose = () => {
            setStatus('closed');
        };

        socketRef.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setStatus('error');
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="live-terminal-container">
            <div className="terminal-header">
                <div className="terminal-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                </div>
                <div className="terminal-title">AI Processing Terminal</div>
                <div className={`terminal-status-indicator ${status}`}></div>
            </div>
            
            <div className="terminal-window">
                {logs.length === 0 ? (
                    <div className="terminal-line system">Initializing WebSocket connection...</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className={`terminal-line ${log.type}`}>
                            <span className="terminal-prefix">{'>'}</span> {log.text}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default LiveTerminal;
