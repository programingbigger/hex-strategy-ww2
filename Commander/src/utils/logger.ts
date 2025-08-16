/**
 * File-based logging system for browser environment with transport/infantry operation tracking
 * Logs are accumulated in memory and can be downloaded as .txt files
 */

export interface LogEntry {
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info' | 'transport' | 'infantry' | 'unit_movement';
  message: string;
  data?: any;
}

export interface TransportOperation {
  infantryId: string;
  infantryName: string;
  transportId: string;
  transportName: string;
  position: { x: number; y: number };
  team: string;
  operation: 'load' | 'unload';
}

export interface InfantryAction {
  infantryId: string;
  infantryName: string;
  action: 'move' | 'attack' | 'capture' | 'wait' | 'load_transport';
  position: { x: number; y: number };
  team: string;
  target?: { x: number; y: number; type?: string };
}

export interface UnitMovement {
  unitId: string;
  unitName: string;
  unitType: string;
  team: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  fuel: number;
  remainingMovement: number;
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
   * 🚛 Log transport operations (loading/unloading infantry)
   */
  logTransportOperation(operation: TransportOperation) {
    const emoji = operation.operation === 'load' ? '📦' : '📤';
    const message = `${emoji} Transport ${operation.operation.toUpperCase()}: Infantry ${operation.infantryName} (${operation.infantryId}) ${operation.operation === 'load' ? 'loaded into' : 'unloaded from'} Transport ${operation.transportName} (${operation.transportId}) at position (${operation.position.x}, ${operation.position.y}) - Team: ${operation.team}`;
    
    // Output to browser console with highlighting
    console.group(`🚛 [TRANSPORT] ${message}`);
    console.log('📊 Operation Details:', operation);
    console.groupEnd();
    
    // Add to file log
    this.addLog('transport', message, operation);
  }

  /**
   * 🪖 Log infantry actions
   */
  logInfantryAction(action: InfantryAction) {
    const actionEmojis = {
      move: '🏃',
      attack: '⚔️',
      capture: '🏴',
      wait: '⏸️',
      load_transport: '📦'
    };
    
    const emoji = actionEmojis[action.action] || '👤';
    let message = `${emoji} Infantry ${action.action.toUpperCase()}: ${action.infantryName} (${action.infantryId}) at (${action.position.x}, ${action.position.y}) - Team: ${action.team}`;
    
    if (action.target) {
      message += ` → Target: (${action.target.x}, ${action.target.y})${action.target.type ? ` [${action.target.type}]` : ''}`;
    }
    
    // Output to browser console with highlighting
    console.group(`🪖 [INFANTRY] ${message}`);
    console.log('📊 Action Details:', action);
    console.groupEnd();
    
    // Add to file log
    this.addLog('infantry', message, action);
  }

  /**
   * 🎯 Log unit movement
   */
  logUnitMovement(movement: UnitMovement) {
    const message = `🎯 UNIT MOVEMENT: ${movement.unitType} ${movement.unitName} (${movement.unitId}) moved from (${movement.from.x}, ${movement.from.y}) to (${movement.to.x}, ${movement.to.y}) - Team: ${movement.team} | Fuel: ${movement.fuel} | Remaining Movement: ${movement.remainingMovement}`;
    
    // Output to browser console with highlighting
    console.group(`🎯 [MOVEMENT] ${message}`);
    console.log('📊 Movement Details:', movement);
    console.groupEnd();
    
    // Add to file log
    this.addLog('unit_movement', message, movement);
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
   * Get transport and infantry logs only
   */
  getTransportInfantryLogsAsText(): string {
    const filteredLogs = this.logs.filter(entry => 
      entry.level === 'transport' || 
      entry.level === 'infantry' || 
      entry.level === 'unit_movement'
    );
    
    return filteredLogs.map(entry => {
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
   * Download transport/infantry logs only
   */
  downloadTransportInfantryLogs(filename?: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `transport-infantry-logs-${timestamp}.txt`;
    const finalFilename = filename || defaultFilename;

    const logsText = this.getTransportInfantryLogsAsText();
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`📥 Transport/Infantry logs downloaded as: ${finalFilename}`);
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
   * Get transport/infantry logs count
   */
  getTransportInfantryLogsCount(): number {
    return this.logs.filter(entry => 
      entry.level === 'transport' || 
      entry.level === 'infantry' || 
      entry.level === 'unit_movement'
    ).length;
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

// 🚛 Transport & Infantry logging functions
export const logTransportOperation = (operation: TransportOperation) => fileLogger.logTransportOperation(operation);
export const logInfantryAction = (action: InfantryAction) => fileLogger.logInfantryAction(action);
export const logUnitMovement = (movement: UnitMovement) => fileLogger.logUnitMovement(movement);

// Export logger instance for direct access
export default fileLogger;