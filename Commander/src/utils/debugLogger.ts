/**
 * 🎯 Battle Log Debug System
 * 視覚的で直感的なデバッグログシステム
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN', 
  ERROR = 'ERROR',
  BATTLE = 'BATTLE',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class BattleLogDebugger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // メモリ使用量制限

  private getIcon(level: LogLevel): string {
    switch (level) {
      case LogLevel.INFO: return '🔍';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      case LogLevel.BATTLE: return '⚔️';
      case LogLevel.DEBUG: return '🐛';
      default: return '📝';
    }
  }

  private formatTimestamp(date: Date): string {
    return date.toLocaleTimeString('ja-JP', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
  }

  private log(level: LogLevel, category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data
    };

    this.logs.push(entry);
    
    // ログ数制限
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // コンソール出力（視覚的フォーマット）
    const icon = this.getIcon(level);
    const timestamp = this.formatTimestamp(entry.timestamp);
    const prefix = `${icon} [${timestamp}] [${category}]`;
    
    if (data) {
      console.group(`${prefix} ${message}`);
      console.log('📊 Data:', data);
      console.groupEnd();
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  // 🎯 バトルログ関連のログ
  battleLog(message: string, data?: any): void {
    this.log(LogLevel.BATTLE, 'BATTLE_LOG', message, data);
  }

  // 🔍 情報ログ
  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  // ⚠️ 警告ログ
  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  // ❌ エラーログ
  error(category: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  // 🐛 デバッグログ
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  // 📊 ログの取得
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // 🧹 ログのクリア
  clear(): void {
    this.logs = [];
    console.clear();
    this.info('SYSTEM', '🧹 Debug logs cleared');
  }

  // 📈 ログ統計
  getStats(): { [key in LogLevel]: number } {
    const stats = {
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.BATTLE]: 0,
      [LogLevel.DEBUG]: 0
    };

    this.logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }
}

// シングルトンインスタンス
export const battleLogDebugger = new BattleLogDebugger();

// ヘルパー関数（短縮形）
export const logBattle = (message: string, data?: any) => battleLogDebugger.battleLog(message, data);
export const logInfo = (category: string, message: string, data?: any) => battleLogDebugger.info(category, message, data);
export const logWarn = (category: string, message: string, data?: any) => battleLogDebugger.warn(category, message, data);
export const logError = (category: string, message: string, data?: any) => battleLogDebugger.error(category, message, data);
export const logDebug = (category: string, message: string, data?: any) => battleLogDebugger.debug(category, message, data);