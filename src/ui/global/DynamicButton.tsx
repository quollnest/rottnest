import React, { useState, useEffect } from 'react';
import { RollbackOutlined, CheckCircleOutlined, DisconnectOutlined } from '@ant-design/icons';
import styles from '../styles/GlobalBar.module.css';
import RottnestContainer from '../container/RottnestContainer.tsx';
// Import the specific functions from AppService
import { ConnectionReady, GetAppServiceInstance } from '../../net/AppService.ts';

const MAX_RECONNECTS: number = 10;

type ConnectionStatusProps = {
  	container: RottnestContainer;
  	onClick: () => void;
};

enum ConnectionStateKind {
  	CONNECTED = 'connected',
  	DISCONNECTED = 'disconnected',
  	CONNECTING = 'connecting'
}

type ConnectionState = {
  state: ConnectionStateKind,
  reconnectAttempts: number
}

/**
 * A button that shows the current connection status
 * and allows reconnecting to the backend
 */
const ConnectionStatusButton: React.FC<ConnectionStatusProps> = ({ onClick }) => {

	const [connectionState, setConnectionState] = useState<ConnectionState>(
  		ConnectionReady() 
    			? { state: ConnectionStateKind.CONNECTED, reconnectAttempts: 0 }
    			: { state: ConnectionStateKind.DISCONNECTED, reconnectAttempts: 0 }
	);

	// Handler for the click event
	const handleClick = () => {
  		
	// If we're not connected, try to reconnect
  		if (connectionState.state !== ConnectionStateKind.CONNECTED) {
    			const appService = GetAppServiceInstance();
    			appService.reconnect();
    			const nstate = {...connectionState};
    			nstate.reconnectAttempts += 1;
    			nstate.state = ConnectionStateKind.CONNECTING;
    			setConnectionState(nstate);
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
  			const nstate = {...connectionState};
  			nstate.reconnectAttempts = 0;
  			nstate.state = ConnectionStateKind.CONNECTED;
  			setConnectionState(nstate);
			} else if (appService.isConnecting()) {
  			const nstate = {...connectionState};
  			nstate.state = ConnectionStateKind.CONNECTING;
  			setConnectionState(nstate);
			} else {
  			appService.reconnect();
  			const nstate = {...connectionState};

  			if(nstate.reconnectAttempts < MAX_RECONNECTS) {
    			nstate.reconnectAttempts += 1;
    			nstate.state = ConnectionStateKind.CONNECTING;
    			setConnectionState(nstate);
  			} else {
  			  nstate.state = ConnectionStateKind.DISCONNECTED;
    			setConnectionState(nstate);
  			}
			}
			
		};

		checkConnection();
  
  	const interval = setInterval(checkConnection, 2000);
  
  	const appService = GetAppServiceInstance();
  
  	const handleOpen = () => {

			const nstate = {...connectionState};
			nstate.state = ConnectionStateKind.CONNECTED;
  		setConnectionState(nstate);
  	};

  	const handleDisconnect = () => {
			const nstate = {...connectionState};
			nstate.state = ConnectionStateKind.DISCONNECTED;
  		setConnectionState(nstate);
  	};

  	appService.registerDisconnectFn(handleDisconnect);
  
  	appService.registerOpenFn(handleOpen);
  
  	return () => {
    		clearInterval(interval);
    		// Note: There's no way to unregister the open handler in the current AppServiceClient
  	};
	}, []);

	// Render icon based on connection state
	const getIcon = () => {
  		switch (connectionState.state) {
    			case ConnectionStateKind.CONNECTED:
      			return <CheckCircleOutlined />;
    			case ConnectionStateKind.DISCONNECTED:
      			return <DisconnectOutlined />;
    			case ConnectionStateKind.CONNECTING:
      			return <RollbackOutlined className={styles.spinning} />;
  		}	
	};

	// Get tooltip text based on connection state
	const getTooltip = () => {
  		switch (connectionState.state) {
    			case ConnectionStateKind.CONNECTED:
      			return "Connected to API";
    			case ConnectionStateKind.DISCONNECTED:
      			return "Disconnected from API - Click to reconnect";
    			case ConnectionStateKind.CONNECTING:
      			return "Connecting to API...";
    			default:
      			return "Connection status unknown";
  			}
	};

	return (
  		<li 
    			onClick={handleClick}
    			className={`${styles.barItem} ${styles.reconnect} ${styles[connectionState.state]}`}
    			title={getTooltip()}
  		>
		<div className={styles.barItemContent}>
			<span className={styles.barItemIcon}>{getIcon()}</span>
			<span className={styles.barItemText}>
			{connectionState.state === ConnectionStateKind.CONNECTED ? "Connected" : "Reconnect"}
			</span>
		</div>
  		</li>
	);
};

export default ConnectionStatusButton;
