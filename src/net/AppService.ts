
import { AppServiceMessage } from "./AppServiceMessage.ts"; 
import {RottArchMSG, RottRunResultMSG, RottSubTypesMSG} from "./Messages.ts";

export const APP_URL: string = "ws://localhost:8080/websocket";

const WS_ONMESSAGE: string = "message";
const WS_ONSEND: string = "send";
const WS_ONOPEN: string = "open";
//const WS_ONERROR: string = "error";
//const WS_ONCLOSE: string = "close";

//TODO: Remove the fucking hack
export type WSConnectFns = {
	onOpenFn: (aps: AppServiceClient) => void
	onMessageFn: (aps: AppServiceClient) => void
}

export type ASRecvCallback 
	= (data: string | Uint8Array) => void;

export class AppServiceClient {
	
	url: string | null = null;
	socket: WebSocket | null = null;
	buffer: Array<AppServiceMessage> = [];
	bufferCapacity: number = 256;
	
	receiveTriggers: Map<string, ASRecvCallback> = new Map();

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

	
	sendMsg(msg: string) {
		if(this.socket) {
			this.socket.send(
				msg
			);
		}
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
			const asm = new AppServiceMessage(e.data);
			self.queue(asm);
			asm.parseData();
			const jsmsg = asm.getJSON();
			if(jsmsg) {
				let mtype = jsmsg['message'];
				let fn = this.receiveTriggers
					.get(mtype);
				if(fn) {
					fn(e.data);
				}
			}
		}
		const onSendHandler = (_: any) => {}
		const onOpenHandler = (_: any) => {}
		if(this.url) {
			this.socket = new WebSocket(this.url);
			//Attach the events
			this.socket.addEventListener(
				WS_ONOPEN, onOpenHandler);
			this.socket.addEventListener(
				WS_ONMESSAGE, onMsgHandler);
			this.socket.addEventListener(
				WS_ONSEND, onSendHandler);
		}
		return this.isConnecting() ||
			this.isConnected();
	}

	registerReciverKinds(evKind: string, 
			     callback: ASRecvCallback) {
		this.receiveTriggers.set(evKind, callback);
	}

	retrieveSubTypes() {
				
		const data = this.dequeue();
		if(data) {
			const msgContainer =
				new RottSubTypesMSG();
			data.parseData();
			const realData = data
				.parseDataTo(msgContainer);
			if(realData) {
				return realData.regionKinds;
			}
		}

		return null;
	}
	
	submitArch(schedMsg: RottArchMSG) {
		if(this.socket) {
			this.socket.send(schedMsg.toJsonStr());
		}
	}

	retrieveRouters() {
		const data = this.dequeue();
		if(data) {
			const msgContainer =
				new RottRouterTypesMSG();
			data.parseData();
			const realData = data
				.parseDataTo(msgContainer);
			if(realData) {
				return realData.regionKinds;
			}
		}

		return null;
	}

	runResult(runMsg: RottRunResultMSG) {
		
		if(this.socket) {
			this.socket.send(runMsg.toJsonStr());
		}
	}

}
