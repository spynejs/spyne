/**
 * Central outlet for SpyneJS developer-hint warnings (invalid selectors,
 * sanitized attributes, policy removals, deprecations).
 *
 * Warnings are suppressed when window.SPYNE_SUPPRESS_WARNINGS is true —
 * primarily for test runs, where expected-failure cases would otherwise
 * flood the reporter. The flag lives on window (not module state) so it
 * spans separately bundled test files.
 *
 * Security-posture warnings (e.g. config.disableSanitize) do NOT route
 * through here and are always printed.
 */
const spyneWarn = (...args) => {
  const suppressed = typeof window !== 'undefined' && window.SPYNE_SUPPRESS_WARNINGS === true
  if (suppressed !== true) {
    console.warn(...args)
  }
}

const setSpyneWarningsDisabled = (bool = true) => {
  if (typeof window !== 'undefined') {
    window.SPYNE_SUPPRESS_WARNINGS = bool === true
  }
}

export { spyneWarn, setSpyneWarningsDisabled }
