/*import { AppServiceClient } from "./AppService.ts";
import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

async function Start() {
	
	const appService = new AppServiceClient(
		"ws://localhost:8080/websocket");
	const rl = readline.createInterface({input: stdin,
					output: stdout});
	
	for await(const line of rl) {
		if(line == 'STATUS') {
			const statCon = appService.isConnecting();
			const statConD = appService.isConnected();

			console.log(`Is Connecting: ${statCon} | `+
				    `is Connected: ${statConD}`);
	
		} else if(line == 'CONNECT') {
			if(!appService.isConnected()) {
				appService.connect();
			} else {
				console.log("Already connected");
			}
		} else if(line == 'SOCKET') {
			console.log(appService.socket);
		} else {
			console.log(appService);
		}
	}


	


}

Start().then(console.log);*/
