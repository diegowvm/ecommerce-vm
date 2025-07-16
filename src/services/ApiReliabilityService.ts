// Utility for implementing retry logic with exponential backoff and circuit breaker pattern
export class ApiReliabilityService {
  private static circuitBreakers = new Map<string, CircuitBreaker>();

  // Retry with exponential backoff
  static async retry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
      retryCondition?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
      retryCondition = this.isRetryableError
    } = options;

    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }

        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  // Execute operation with circuit breaker protection
  static async withCircuitBreaker<T>(
    serviceKey: string,
    operation: () => Promise<T>,
    options: {
      failureThreshold?: number;
      timeout?: number;
      resetTimeout?: number;
    } = {}
  ): Promise<T> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(serviceKey, options);
    return circuitBreaker.execute(operation);
  }

  // Combined retry + circuit breaker
  static async callExternalApi<T>(
    serviceKey: string,
    operation: () => Promise<T>,
    retryOptions?: Parameters<typeof ApiReliabilityService.retry>[1],
    circuitOptions?: Parameters<typeof ApiReliabilityService.withCircuitBreaker>[2]
  ): Promise<T> {
    return this.withCircuitBreaker(
      serviceKey,
      () => this.retry(operation, retryOptions),
      circuitOptions
    );
  }

  private static getOrCreateCircuitBreaker(serviceKey: string, options: any): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceKey)) {
      this.circuitBreakers.set(serviceKey, new CircuitBreaker(options));
    }
    return this.circuitBreakers.get(serviceKey)!;
  }

  private static isRetryableError(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx/429 status codes
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') {
      return true;
    }
    
    const status = error?.status || error?.response?.status;
    return status === 429 || (status >= 500 && status < 600);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate user-friendly error messages
  static generateUserFriendlyError(serviceKey: string, error: any): string {
    const baseMessages = {
      'mercadolivre': 'A integração com o Mercado Livre está com problemas.',
      'amazon': 'A integração com a Amazon está indisponível.',
      'aliexpress': 'A conexão com AliExpress falhou.',
      'default': 'Serviço externo indisponível.'
    };

    const baseMessage = baseMessages[serviceKey.toLowerCase()] || baseMessages.default;
    
    if (error?.status === 401 || error?.status === 403) {
      return `${baseMessage} Verifique suas credenciais de API.`;
    }
    
    if (error?.status === 429) {
      return `${baseMessage} Limite de requisições excedido. Tente novamente em alguns minutos.`;
    }
    
    if (error?.code === 'CIRCUIT_BREAKER_OPEN') {
      return `${baseMessage} Serviço temporariamente indisponível devido a falhas consecutivas.`;
    }
    
    return `${baseMessage} Tente novamente mais tarde ou contate o suporte.`;
  }
}

// Simple Circuit Breaker implementation
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  
  constructor(
    private options: {
      failureThreshold?: number;
      timeout?: number;
      resetTimeout?: number;
    } = {}
  ) {
    this.options = {
      failureThreshold: 5,
      timeout: 60000, // 1 minute
      resetTimeout: 30000, // 30 seconds
      ...options
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.options.resetTimeout!) {
        throw new Error('CIRCUIT_BREAKER_OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.options.failureThreshold!) {
      this.state = 'OPEN';
    }
  }
}