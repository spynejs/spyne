let _config

export class SecurityPolicy {
  constructor(config = {}) {
    _config = config
  }

  get config() {
    return _config
  }
}
