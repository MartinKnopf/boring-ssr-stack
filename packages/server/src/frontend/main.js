/**
 * @fileoverview This is the main entry point for the frontend application.
 */

// @ts-ignore -- Alpine ships without types; keep this file JSDoc-only.
import Alpine from 'alpinejs'
import htmx from 'htmx.org'

// Initialize Alpine.js
window.Alpine = Alpine
Alpine.start()
Alpine.store('alpineInitialized', true)

// Expose htmx globally for inline scripts
window.htmx = htmx

// Set ready flag and dispatch event after initialization
window.__appReady = true
// @ts-ignore - document and CustomEvent are available in browser context
document.dispatchEvent(new CustomEvent('app:ready'))
