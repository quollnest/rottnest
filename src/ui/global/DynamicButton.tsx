import React, { useState, useEffect } from 'react';
import { RollbackOutlined, CheckCircleOutlined, DisconnectOutlined } from '@ant-design/icons';
import styles from '../styles/GlobalBar.module.css';
import RottnestContainer from './container/RottnestContainer.tsx';
// Import the specific functions from AppService
import { ConnectionReady, GetAppServiceInstance } from '../../net/AppService.ts';

type ConnectionStatusProps = {
  container: RottnestContainer;
  onClick: () => void;
};

enum ConnectionState {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting'
}

/**
 * A button that shows the current connection status
 * and allows reconnecting to the backend
 */
const ConnectionStatusButton: React.FC<ConnectionStatusProps> = ({ container, onClick }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionReady() 
      ? ConnectionState.CONNECTED 
      : ConnectionState.DISCONNECTED
  );
  
  // Handler for the click event
  const handleClick = () => {
    // If we're not connected, try to reconnect
    if (connectionState !== ConnectionState.CONNECTED) {
      const appService = GetAppServiceInstance();
      appService.reconnect();
      setConnectionState(ConnectionState.CONNECTING);
    }
    
    // Also call the parent's onClick handler if provided
    if (onClick) {
      onClick();
    }
  };
  
  useEffect(() => {
    // Set up connection status check
    const checkConnection = () => {
      const appService = GetAppServiceInstance();
      if (appService.isConnected()) {
        setConnectionState(ConnectionState.CONNECTED);
      } else if (appService.isConnecting()) {
        setConnectionState(ConnectionState.CONNECTING);
      } else {
        setConnectionState(ConnectionState.DISCONNECTED);
      }
    };

    // Check initial connection
    checkConnection();
    
    // Set up periodic connection check
    const interval = setInterval(checkConnection, 2000);
    
    // Register event handlers
    const appService = GetAppServiceInstance();
    
    // Create a wrapper function for connection open event
    const handleOpen = () => {
      setConnectionState(ConnectionState.CONNECTED);
    };

    const handleDisconnect = () => {
    	setConnectionState(ConnectionState.DISCONNECTED);
    };

    appService.registerDisconnectFn(handleDisconnect);
    
    // Register the open function with the AppServiceClient
    appService.registerOpenFn(handleOpen);
    
    return () => {
      clearInterval(interval);
      // Note: There's no way to unregister the open handler in the current AppServiceClient
    };
  }, []);
  
  // Render icon based on connection state
  const getIcon = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return <CheckCircleOutlined />;
      case ConnectionState.DISCONNECTED:
        return <DisconnectOutlined />;
      case ConnectionState.CONNECTING:
        return <RollbackOutlined className={styles.spinning} />;
    }
  };
  
  // Get tooltip text based on connection state
  const getTooltip = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return "Connected to API";
      case ConnectionState.DISCONNECTED:
        return "Disconnected from API - Click to reconnect";
      case ConnectionState.CONNECTING:
        return "Connecting to API...";
      default:
        return "Connection status unknown";
    }
  };
  
  return (
    <li 
      onClick={handleClick}
      className={`${styles.barItem} ${styles.reconnect} ${styles[connectionState]}`}
      title={getTooltip()}
    >
      <div className={styles.barItemContent}>
        <span className={styles.barItemIcon}>{getIcon()}</span>
        <span className={styles.barItemText}>
          {connectionState === ConnectionState.CONNECTED ? "Connected" : "Reconnect"}
        </span>
      </div>
    </li>
  );
};

export default ConnectionStatusButton;
