export default class Socket {
  webSocket: WebSocket;

  onMessage: ((states: string) => void);

  constructor() {
    this.webSocket = new WebSocket('ws://localhost:3001');
    this.webSocket.onmessage = (message) => {
      console.log(message);
      this.onMessage(JSON.parse(message.data));
    };
    this.webSocket.onopen = () => {
      console.log('open');
    };
    this.webSocket.onclose = () => {
      console.log('close');
    };
  }

  sendState(arr: string) {
    this.webSocket.send(JSON.stringify(arr));
  }

  destroy() {

  }
}
