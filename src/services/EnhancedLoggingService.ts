// Enhanced logging service with detailed context and error tracking
export class EnhancedLoggingService {
  private static instance: EnhancedLoggingService;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  static getInstance(): EnhancedLoggingService {
    if (!EnhancedLoggingService.instance) {
      EnhancedLoggingService.instance = new EnhancedLoggingService();
    }
    return EnhancedLoggingService.instance;
  }

  // Log with detailed context
  log(level: LogLevel, message: string, context: LogContext = {}): void {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...context,
        userAgent: navigator?.userAgent || 'unknown',
        url: window?.location?.href || 'unknown'
      },
      stackTrace: level === 'error' ? this.getStackTrace() : undefined
    };

    this.logs.push(entry);
    this.trimLogs();
    
    // Console output with formatting
    this.outputToConsole(entry);
    
    // Send to external monitoring if configured
    this.sendToExternalMonitoring(entry);
  }

  // Specialized logging methods
  logApiCall(
    operation: string,
    marketplace: string,
    productId?: string,
    duration?: number,
    success?: boolean,
    error?: any
  ): void {
    this.log(success ? 'info' : 'error', `API Call: ${operation}`, {
      operation_type: 'api_call',
      marketplace,
      product_id: productId,
      duration_ms: duration,
      success,
      error_message: error?.message,
      error_code: error?.status || error?.code
    });
  }

  logSyncOperation(
    marketplace: string,
    syncType: string,
    productsProcessed: number,
    productsUpdated: number,
    errors: string[],
    duration: number
  ): void {
    this.log('info', `Sync Operation: ${marketplace} (${syncType})`, {
      operation_type: 'sync_operation',
      marketplace,
      sync_type: syncType,
      products_processed: productsProcessed,
      products_updated: productsUpdated,
      error_count: errors.length,
      errors,
      duration_ms: duration,
      success_rate: productsProcessed > 0 ? (productsUpdated / productsProcessed * 100).toFixed(2) + '%' : '0%'
    });
  }

  logRetryAttempt(
    operation: string,
    attempt: number,
    maxAttempts: number,
    error: any,
    nextDelay?: number
  ): void {
    this.log('warn', `Retry Attempt: ${operation}`, {
      operation_type: 'retry_attempt',
      operation,
      attempt,
      max_attempts: maxAttempts,
      error_message: error?.message,
      error_code: error?.status || error?.code,
      next_delay_ms: nextDelay
    });
  }

  logCircuitBreakerEvent(
    serviceKey: string,
    event: 'opened' | 'closed' | 'half_open',
    failureCount?: number
  ): void {
    this.log('warn', `Circuit Breaker ${event.toUpperCase()}: ${serviceKey}`, {
      operation_type: 'circuit_breaker',
      service_key: serviceKey,
      event,
      failure_count: failureCount,
      timestamp: new Date().toISOString()
    });
  }

  logUserAction(action: string, context: Record<string, any> = {}): void {
    this.log('info', `User Action: ${action}`, {
      operation_type: 'user_action',
      action,
      ...context
    });
  }

  logApiError(marketplace: string, operation: string, message: string): void {
    this.log('error', `API Error: ${marketplace} - ${operation}`, {
      operation_type: 'api_error',
      marketplace,
      operation,
      error_message: message
    });
  }

  logApiSuccess(marketplace: string, operation: string, duration: number): void {
    this.log('info', `API Success: ${marketplace} - ${operation}`, {
      operation_type: 'api_success',
      marketplace,
      operation,
      duration_ms: duration
    });
  }

  logRateLimitEvent(marketplace: string, event: string, details: any): void {
    this.log('warn', `Rate Limit: ${marketplace} - ${event}`, {
      operation_type: 'rate_limit',
      marketplace,
      event,
      ...details
    });
  }

  // Get logs with filtering
  getLogs(
    filter: {
      level?: LogLevel;
      operation_type?: string;
      marketplace?: string;
      since?: Date;
      limit?: number;
    } = {}
  ): LogEntry[] {
    let filteredLogs = this.logs;

    if (filter.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter.operation_type) {
      filteredLogs = filteredLogs.filter(log => log.context.operation_type === filter.operation_type);
    }

    if (filter.marketplace) {
      filteredLogs = filteredLogs.filter(log => log.context.marketplace === filter.marketplace);
    }

    if (filter.since) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filter.since!);
    }

    if (filter.limit) {
      filteredLogs = filteredLogs.slice(-filter.limit);
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Private methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getStackTrace(): string {
    const stack = new Error().stack;
    return stack?.split('\n').slice(2).join('\n') || '';
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const color = this.getConsoleColor(entry.level);
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    
    console.log(
      `%c${prefix} ${entry.message}`,
      `color: ${color}; font-weight: bold;`,
      entry.context.operation_type ? `\n  Operation: ${entry.context.operation_type}` : '',
      entry.context.marketplace ? `\n  Marketplace: ${entry.context.marketplace}` : '',
      entry.context.product_id ? `\n  Product ID: ${entry.context.product_id}` : '',
      entry.context.duration_ms ? `\n  Duration: ${entry.context.duration_ms}ms` : '',
      entry.context.error_message ? `\n  Error: ${entry.context.error_message}` : '',
      entry.stackTrace ? `\n  Stack: ${entry.stackTrace}` : ''
    );
  }

  private getConsoleColor(level: LogLevel): string {
    switch (level) {
      case 'error': return '#ff4444';
      case 'warn': return '#ff8800';
      case 'info': return '#0088ff';
      case 'debug': return '#888888';
      default: return '#000000';
    }
  }

  private sendToExternalMonitoring(entry: LogEntry): void {
    // Implementation for external monitoring services
    // This could send to services like Sentry, LogRocket, etc.
    // For now, we'll just keep it local
  }
}

// Types
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  stackTrace?: string;
}

export interface LogContext {
  operation_type?: string;
  marketplace?: string;
  product_id?: string;
  duration_ms?: number;
  success?: boolean;
  error_message?: string;
  error_code?: string | number;
  attempt?: number;
  max_attempts?: number;
  next_delay_ms?: number;
  service_key?: string;
  event?: string;
  failure_count?: number;
  sync_type?: string;
  products_processed?: number;
  products_updated?: number;
  error_count?: number;
  errors?: string[];
  success_rate?: string;
  action?: string;
  userAgent?: string;
  url?: string;
  [key: string]: any;
}

// Export singleton instance
export const logger = EnhancedLoggingService.getInstance();
