/**
 * File-based logging system for browser environment
 * Logs are accumulated in memory and can be downloaded as .txt files
 */

export interface LogEntry {
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  data?: any;
}

class FileLogger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 10000; // Prevent memory overflow
  private readonly storageKey = 'hex-strategy-game-logs';
  
  constructor() {
    // Load existing logs from localStorage on initialization
    this.loadFromStorage();
    
    // Auto-save logs every 30 seconds
    setInterval(() => this.saveToStorage(), 30000);
    
    // Save logs before page unload
    window.addEventListener('beforeunload', () => this.saveToStorage());
  }

  /**
   * Add a log entry
   */
  private addLog(level: LogEntry['level'], message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined
    };

    this.logs.push(entry);

    // Prevent memory overflow by keeping only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Log with level 'log'
   */
  log(message: string, ...data: any[]) {
    // Output to browser console
    console.log(message, ...data);
    
    // Add to file log
    this.addLog('log', message, data.length > 0 ? data : undefined);
  }

  /**
   * Log with level 'error'  
   */
  error(message: string, ...data: any[]) {
    // Output to browser console
    console.error(message, ...data);
    
    // Add to file log
    this.addLog('error', message, data.length > 0 ? data : undefined);
  }

  /**
   * Log with level 'warn'
   */
  warn(message: string, ...data: any[]) {
    // Output to browser console
    console.warn(message, ...data);
    
    // Add to file log
    this.addLog('warn', message, data.length > 0 ? data : undefined);
  }

  /**
   * Log with level 'info'
   */
  info(message: string, ...data: any[]) {
    // Output to browser console
    console.info(message, ...data);
    
    // Add to file log
    this.addLog('info', message, data.length > 0 ? data : undefined);
  }

  /**
   * Get all logs as formatted string
   */
  getLogsAsText(): string {
    return this.logs.map(entry => {
      const dataStr = entry.data ? `\nData: ${entry.data}` : '';
      return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${dataStr}`;
    }).join('\n\n');
  }

  /**
   * Download logs as .txt file
   */
  downloadLogs(filename?: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `hex-strategy-logs-${timestamp}.txt`;
    const finalFilename = filename || defaultFilename;

    const logsText = this.getLogsAsText();
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`📥 Logs downloaded as: ${finalFilename}`);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.storageKey);
    console.log('🧹 All logs cleared');
  }

  /**
   * Get logs count
   */
  getLogsCount(): number {
    return this.logs.length;
  }

  /**
   * Save logs to localStorage
   */
  private saveToStorage() {
    try {
      const logsData = {
        timestamp: new Date().toISOString(),
        logs: this.logs
      };
      localStorage.setItem(this.storageKey, JSON.stringify(logsData));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const logsData = JSON.parse(stored);
        if (logsData.logs && Array.isArray(logsData.logs)) {
          this.logs = logsData.logs;
          console.log(`📂 Loaded ${this.logs.length} logs from storage`);
        }
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }
}

// Create singleton instance
export const fileLogger = new FileLogger();

// Convenience functions
export const log = (message: string, ...data: any[]) => fileLogger.log(message, ...data);
export const logError = (message: string, ...data: any[]) => fileLogger.error(message, ...data);
export const logWarn = (message: string, ...data: any[]) => fileLogger.warn(message, ...data);
export const logInfo = (message: string, ...data: any[]) => fileLogger.info(message, ...data);

// Export logger instance for direct access
export default fileLogger;