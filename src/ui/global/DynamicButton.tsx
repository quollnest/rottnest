import React, { useState, useEffect } from 'react';
import { RollbackOutlined, CheckCircleOutlined, DisconnectOutlined } from '@ant-design/icons';
import styles from '../styles/GlobalBar.module.css';
import RottnestContainer from './container/RottnestContainer.tsx';
// Import the specific functions from AppService instead of importing as default
import * as AppServiceModule from '../../net/AppService.ts';

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
  // Safe check if we can access the AppService instance
  const getAppServiceInstance = () => {
    if (typeof AppServiceModule.GetAppServiceInstance === 'function') {
      return AppServiceModule.GetAppServiceInstance();
    }
    return null;
  };
  
  // Check if connection is ready
  const checkConnectionReady = () => {
    const appService = getAppServiceInstance();
    if (appService && typeof appService.isConnected === 'function') {
      return appService.isConnected();
    }
    return false;
  };
  
  // Check if connection is in progress
  const checkIsConnecting = () => {
    const appService = getAppServiceInstance();
    if (appService && typeof appService.isConnecting === 'function') {
      return appService.isConnecting();
    }
    return false;
  };

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    checkConnectionReady() 
      ? ConnectionState.CONNECTED 
      : ConnectionState.DISCONNECTED
  );
  
  useEffect(() => {
    // Set up connection status check
    const checkConnection = () => {
      const isConnected = checkConnectionReady();
      const isConnecting = checkIsConnecting();
      
      if (isConnected) {
        setConnectionState(ConnectionState.CONNECTED);
      } else if (isConnecting) {
        setConnectionState(ConnectionState.CONNECTING);
      } else {
        setConnectionState(ConnectionState.DISCONNECTED);
      }
    };

    // Check initial connection
    checkConnection();
    
    // Set up periodic connection check
    const interval = setInterval(checkConnection, 2000);
    
    // Try to register event listeners if possible
    const tryRegisterListeners = () => {
      const appService = getAppServiceInstance();
      if (!appService || !appService.on) return () => {};
      
      const onConnect = () => setConnectionState(ConnectionState.CONNECTED);
      const onDisconnect = () => setConnectionState(ConnectionState.DISCONNECTED);
      const onConnecting = () => setConnectionState(ConnectionState.CONNECTING);
      
      try {
        appService.on('connect', onConnect);
        appService.on('disconnect', onDisconnect);
        appService.on('connecting', onConnecting);
        
        return () => {
          if (appService.off) {
            appService.off('connect', onConnect);
            appService.off('disconnect', onDisconnect);
            appService.off('connecting', onConnecting);
          }
        };
      } catch (error) {
        console.error("Error setting up connection listeners:", error);
        return () => {};
      }
    };
    
    const cleanupListeners = tryRegisterListeners();
    
    return () => {
      clearInterval(interval);
      cleanupListeners();
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
      onClick={onClick}
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
