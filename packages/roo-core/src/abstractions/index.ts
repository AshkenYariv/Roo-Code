/**
 * Roo-Code Core Abstractions
 * 
 * Platform-independent implementations of core interfaces
 */

// Core interfaces
export * from './interfaces'

// Node.js implementations  
export * from './nodejs/NodeFileSystem'
export * from './nodejs/NodeLogger'
export * from './nodejs/NodeWorkspace'
export * from './nodejs/NodeConfiguration'
export * from './nodejs/NodeNotification'
export * from './nodejs/NodeSystemInfo'
export * from './nodejs/NodeClipboard'
export * from './nodejs/NodeExternalApp'
export * from './nodejs/NodeTerminal'

// Dependency container
export * from './DependencyContainer' 