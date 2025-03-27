export interface MCPRequest {
  type: string;
  payload: any;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class MCPServer {
  private handleRequestCallback?: (request: MCPRequest) => Promise<MCPResponse>;

  constructor() {
    process.on('message', async (message: MCPRequest) => {
      if (!this.handleRequestCallback) {
        if (process.send) {
          process.send({
            success: false,
            error: 'Server not ready'
          });
        }
        return;
      }

      try {
        const response = await this.handleRequestCallback(message);
        if (process.send) {
          process.send(response);
        }
      } catch (error) {
        if (process.send) {
          process.send({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    });
  }

  protected setRequestHandler(callback: (request: MCPRequest) => Promise<MCPResponse>) {
    this.handleRequestCallback = callback;
  }

  async start(): Promise<void> {
    // Keep the process running
    process.stdin.resume();
  }
}