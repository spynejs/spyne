class SpyneLoggerClass {
  constructor(props) {
    this._warnings = []
  }

  static warn() {

  }
}

export const SpyneLogger = new SpyneLoggerClass()
