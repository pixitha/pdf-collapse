/**
 * Manage global debug logging.
 */

let pdfcollapseDebug = false;

/**
 * Enable or disable debug logging.
 * @param enable true to enable, false to disable
 */
export function setDebug(enable: boolean): void {
  pdfcollapseDebug = enable;
}

export function debug(...args: unknown[]): void {
    if (pdfcollapseDebug) {
        console.debug('pdf-collapse - ', ...args);
    }
}