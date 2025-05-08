import {RottnestKindMap} from "../model/RegionKindMap.ts";
import { AppServiceMessage } from "./AppServiceMessage.ts"; 
import {RottArchMSG, RottGraphMSG, RottRouterTypesMSG, RottRunResultMSG, RottSubTypesMSG} from "./Messages.ts";

export const APP_URL: string = "ws://localhost:8080/websocket";

const WS_ONMESSAGE: string = "message";
const WS_ONSEND: string = "send";
const WS_ONOPEN: string = "open";
//const WS_ONERROR: string = "error";
//const WS_ONCLOSE: string = "close";

export interface ASContextHook {
	//callbackMap(): Map<string, ASRecvContextCallback>
	serviceHook(asm: AppServiceMessage): void
}

export type ASOpenCallback 
	= () => void;

export type ASRecvCallback 
	= (asm: AppServiceMessage) => void;

export type ASRecvContextCallback 
	= (ctx: ASContextHook, asm: AppServiceMessage) => void;

export type ASDisconnectCallback = () => void;

export class AppServiceClient {
	
	url: string | null = null;
	socket: WebSocket | null = null;
	buffer: Array<AppServiceMessage> = [];
	bufferCapacity: number = 256;
	
	receiveTriggers: Map<string, 
		ASRecvCallback> = new Map();

	onOpenTrigger: ASOpenCallback | null = null;
	
	onDisconnectTrigger: ASDisconnectCallback | null = null;

	constructor(url: string | null) {
		this.url = url;
	}

	queue(msg: AppServiceMessage): boolean {
		if(this.buffer.length < this.bufferCapacity) {
			this.buffer.push(msg);
			return true;
		}
		console.error("Unable to queue data");
		return false;
	}

	dequeue(): AppServiceMessage | null {
		if(this.buffer.length > 0) {
			const msg = this.buffer.shift();
			if(msg) {
				return msg;
			}
		}
		console.error("No items in the buffer");

		return null;
	}

	reconnect() {
		this.connect();
	}

	close(): boolean {
		if(this.socket !== null) {
			if(this.isConnected()) {	
				return true;
			}
		}
		return false;
	}

	isConnected(): boolean {
		if(this.socket) {
			return this.socket.readyState
				=== 1;
		} else {
			return false
		}
	}

	isConnecting(): boolean {
		if(this.socket) {
			return this.socket.readyState
				=== 0;
		} else {
			return false;
		}
	}

	sendObj(cmd: string, payload: any) {
			
		if(this.socket) {
			this.socket.send(
				JSON.stringify({
					cmd,
					payload
				})	
			);
		}
	}

	
	sendMsg(msg: string) {
		if(this.socket) {
			this.socket.send(
				msg
			);
		}
	}

	// Method to register a disconnect callback
	registerDisconnectFn(disconnectFn: ASDisconnectCallback) {
  		this.onDisconnectTrigger = disconnectFn;
	}

	/**
	 * Will attempt to connect to the
	 * application service process,
	 * will return the state of the connection
	 */
	connect(): boolean {
		
		const self = this;
		if(this.isConnected()) {
			return true;
		}
		
		const onMsgHandler = (e: any) => {
			const asm = 
				new AppServiceMessage(e.data);

			asm.parseData();
			const jsmsg = asm.getJSON();
			if(jsmsg) {
				let mtype = jsmsg['message'];
				let fn = this.receiveTriggers
					.get(mtype);
				if(fn) {
					fn(asm);
				}
			}
		}

		const onSendHandler = (_: any) => {}
		
		const onOpenHandler = (_: any) => {
			if(self.onOpenTrigger) {
				self.onOpenTrigger();
			}
		}

		const onErrorHandler = (_: any) => {
    		if(self.onDisconnectTrigger) {
      			self.onDisconnectTrigger();
    		}
  		}

	  	const onCloseHandler = (_: any) => {
	    	if(self.onDisconnectTrigger) {
	      		self.onDisconnectTrigger();
	    	}
	  	}

		if(this.url) {
			this.socket = new WebSocket(this.url);
			//Attach the events
			this.socket.addEventListener(
				WS_ONOPEN, onOpenHandler);
			this.socket.addEventListener(
				WS_ONMESSAGE, onMsgHandler);
			this.socket.addEventListener(
				WS_ONSEND, onSendHandler);
			this.socket.addEventListener(
				"error", onErrorHandler);
			this.socket.addEventListener(
				"close", onCloseHandler);
		}
		
		return this.isConnecting() ||
			this.isConnected();
	}

	registerReciverKinds(evKind: string, 
			     callback: ASRecvCallback) {
		this.receiveTriggers.set(evKind, callback);
	}

	hookContext(ctx: ASContextHook, evKind: string) {
		const cbWrapper: ASRecvCallback = (asm) => {
			ctx.serviceHook(asm); 
		}
		this.receiveTriggers.set(evKind, cbWrapper);
	}

	registerOpenFn(openFn: ASOpenCallback) {
		this.onOpenTrigger = openFn;	
	}

	decodeGraph(data: any) {
		const msgContainer = new RottGraphMSG();
		data.parseData();
		const realData = data
			.parseDataTo(msgContainer);
		if(realData) {
			return realData.graph;
		}
		return null;
	}

	retrieveSubTypes(data: any) {
				
		const msgContainer =
			new RottSubTypesMSG();
		data.parseData();
		const realData = data
			.parseDataTo(msgContainer);
		if(realData) {
			return realData.regionKinds;
		}
		return null;
	}
	
	submitArch(schedMsg: RottArchMSG) {
		if(this.socket) {
			this.socket.send(schedMsg.toJsonStr());
		}
	}

	retrieveRouters(subTypes: RottnestKindMap, data: any) {
		const msgContainer =
			new RottRouterTypesMSG(subTypes);
		data.parseData();
		const realData = data
			.parseDataTo(msgContainer);

		if(realData) {
			return realData.subtypeMap;
		}
		return null;
	}

	retrieveArgs(m: any) {
		return null;
	}

	runResult(runMsg: RottRunResultMSG) {
		console.log(runMsg);	
		if(this.socket) {
			this.socket.send(runMsg.toJsonStr());
		}
	}
}

// Static function to check if connection is ready
export function ConnectionReady(): boolean {
  	const instance = GetAppServiceInstance();
  	return instance.isConnected();
}

// Singleton instance
let _appServiceInstance: AppServiceClient | null = null;

// Function to get or create the AppServiceClient instance
export function GetAppServiceInstance(): AppServiceClient {
  	if (!_appServiceInstance) {
    		_appServiceInstance = new AppServiceClient(APP_URL);
  	}
  	
	return _appServiceInstance;
}
