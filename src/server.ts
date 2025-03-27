import { readFileSync } from 'fs';
import { join } from 'path';
import { MCPServer, MCPRequest, MCPResponse } from './mcp-sdk.js';

const logger = {
  info: console.log,
  error: console.error
};

interface Config {
  memoryPath: string;
  thoughtStructurePath: string;
}

interface MemoryGraph {
  entities: any[];
  relations: any[];
}

interface ThoughtStructure {
  paths: {
    strategic: any[];
    standard: any[];
    direct: any[];
  };
}

export class StrategicCoDeveloperServer extends MCPServer {
  private config: Config;
  private memoryGraph: MemoryGraph;
  private thoughtStructure: ThoughtStructure;

  constructor(config: Config) {
    super();
    this.config = config;
    this.memoryGraph = this.loadMemoryGraph();
    this.thoughtStructure = this.loadThoughtStructure();
    this.setRequestHandler(this.handleRequest.bind(this));
  }

  private loadMemoryGraph(): MemoryGraph {
    try {
      const content = readFileSync(this.config.memoryPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      logger.error('Failed to load memory graph:', error);
      return { entities: [], relations: [] };
    }
  }

  private loadThoughtStructure(): ThoughtStructure {
    try {
      const content = readFileSync(this.config.thoughtStructurePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      logger.error('Failed to load thought structure:', error);
      return { paths: { strategic: [], standard: [], direct: [] } };
    }
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { type, payload } = request;
    let response;

    try {
      switch (type) {
        case 'create_entity':
          response = await this.createEntity(payload);
          break;
        case 'create_relation':
          response = await this.createRelation(payload);
          break;
        case 'search_nodes':
          response = await this.searchNodes(payload.query);
          break;
        case 'process_thought':
          response = await this.processThought(payload.type, payload.context);
          break;
        default:
          throw new Error(`Unknown request type: ${type}`);
      }

      return {
        success: true,
        data: response
      };
    } catch (error) {
      logger.error('Error handling request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createEntity(entity: any) {
    this.memoryGraph.entities.push(entity);
    return { success: true, entity };
  }

  private async createRelation(relation: any) {
    this.memoryGraph.relations.push(relation);
    return { success: true, relation };
  }

  private async searchNodes(query: string) {
    return {
      entities: this.memoryGraph.entities.filter(e => 
        JSON.stringify(e).toLowerCase().includes(query.toLowerCase())
      ),
      relations: this.memoryGraph.relations.filter(r =>
        JSON.stringify(r).toLowerCase().includes(query.toLowerCase())
      )
    };
  }

  private async processThought(type: 'strategic' | 'standard' | 'direct', context: any) {
    const path = this.thoughtStructure.paths[type];
    return this.executeThoughtSequence(path, context);
  }

  private async executeThoughtSequence(path: any[], context: any) {
    const results = [];
    for (const step of path) {
      const result = await this.executeThoughtStep(step, context);
      results.push(result);
      context = { ...context, previousResult: result };
    }
    return { success: true, results };
  }

  private async executeThoughtStep(step: any, context: any) {
    return {
      step,
      status: 'completed',
      output: `Executed ${step.name || step} with context`
    };
  }

  async start(): Promise<void> {
    await super.start();
    logger.info('Strategic Co-Developer MCP server started');
    logger.info('Ready to handle requests...');
  }
}