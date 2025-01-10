
import { AppServiceMessage } from "./AppServiceMessage.ts"; 

const WS_ONMESSAGE: string = "message";
const WS_ONSEND: string = "send";
const WS_ONERROR: string = "error";
const WS_ONOPEN: string = "open";
const WS_ONCLOSE: string = "close";

//TODO: Remove the fucking hack
export type WSConnectFns = {
	onOpenFn: (aps: AppServiceClient) => void
	onMessageFn: (aps: AppServiceClient) => void
}


export class AppServiceClient {
	
	url: string | null = null;
	socket: WebSocket | null = null;
	buffer: Array<AppServiceMessage> = [];
	bufferCapacity: number = 256;

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

	

	/**
	 * Will attempt to connect to the
	 * application service process,
	 * will return the state of the connection
	 */
	connect(fns?: WSConnectFns): boolean {
		
		const self = this;

		const onMsgHandler = (e: any) => {
		
			console.log(e);	
			self.queue(new AppServiceMessage(e.data));
			if(fns) {
				fns.onMessageFn(self);
			}

		}
		const onSendHandler = (_: any) => {}
		const onOpenHandler = (_: any) => {
			console.log("Attempting to open");
			if(self.socket) {
				if(fns) {
					
					fns.onOpenFn(self);
				}
				//self.socket.send("subtype");
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
		}
		return this.isConnecting() ||
			this.isConnected();
	}

	retrieveSubTypes(): Array<string> {
		let subtypes: Array<string> = [];
			

		return subtypes;
	}

}
