import os from 'os'
import path from 'path'
import crypto from 'crypto'
import { ISystemInfo } from '../interfaces'

export class NodeSystemInfo implements ISystemInfo {
  private _machineId: string | undefined

  get appName(): string {
    return process.env.APP_NAME || 'Roo-Code Server'
  }

  get version(): string {
    return process.env.APP_VERSION || '0.1.0'
  }

  get language(): string {
    return process.env.LANG?.split('.')[0]?.replace('_', '-') || 'en'
  }

  get machineId(): string {
    if (!this._machineId) {
      // Generate a consistent machine ID based on hostname and platform
      const identifier = `${os.hostname()}-${os.platform()}-${os.arch()}`
      this._machineId = crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 32)
    }
    return this._machineId
  }

  get uriScheme(): string {
    return process.env.URI_SCHEME || 'roo-code'
  }

  get platform(): 'win32' | 'darwin' | 'linux' | 'other' {
    const platform = os.platform()
    switch (platform) {
      case 'win32':
      case 'darwin':
      case 'linux':
        return platform
      default:
        return 'other'
    }
  }

  get arch(): string {
    return os.arch()
  }

  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  }

  get cwd(): string {
    return process.cwd()
  }

  getEnvVar(name: string): string | undefined {
    return process.env[name]
  }

  get homeDir(): string {
    return os.homedir()
  }

  get tmpDir(): string {
    return os.tmpdir()
  }
} 