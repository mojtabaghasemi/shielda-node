const https = require('https');

class Shielda {
  /**
   * @param {Object} options
   * @param {string} options.siteKey
   * @param {string} options.secretKey
   * @param {string} [options.verifyUrl]
   * @param {string} [options.widgetUrl]
   * @param {number} [options.timeout]
   */
  constructor({ siteKey, secretKey, verifyUrl, widgetUrl, timeout } = {}) {
    this.siteKey = siteKey || '';
    this.secretKey = secretKey || '';
    this.verifyUrl = verifyUrl || 'https://shielda.ir/api/v1/siteverify';
    this.widgetUrl = widgetUrl || 'https://shielda.ir/widget/api.js';
    this.timeout = timeout || 10000;
  }

  /**
   * Verify captcha response token and return boolean.
   * @param {string} token
   * @param {string} [remoteIp]
   * @returns {Promise<boolean>}
   */
  async verify(token, remoteIp) {
    const res = await this.verifyWithDetails(token, remoteIp);
    return Boolean(res && res.success);
  }

  /**
   * Verify captcha token and return full API payload.
   * @param {string} token
   * @param {string} [remoteIp]
   * @returns {Promise<{success: boolean, error_codes?: string[], challenge_ts?: string, hostname?: string}>}
   */
  async verifyWithDetails(token, remoteIp) {
    if (!token) {
      return { success: false, error_codes: ['missing-input-response'] };
    }
    if (!this.secretKey) {
      return { success: false, error_codes: ['missing-secret-key'] };
    }

    const payload = {
      secret: this.secretKey,
      response: token,
    };
    if (remoteIp) {
      payload.remoteip = remoteIp;
    }

    // Use global fetch if available (Node 18+)
    if (typeof fetch === 'function') {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(this.verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Shielda-Node/1.0.0',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timer);
        return await response.json();
      } catch (err) {
        return {
          success: false,
          error_codes: ['http-connection-error'],
          error_message: err.message,
        };
      }
    }

    // Fallback for older Node versions using https
    return new Promise((resolve) => {
      const dataString = JSON.stringify(payload);
      const url = new URL(this.verifyUrl);

      const req = https.request(
        {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataString),
            'Accept': 'application/json',
            'User-Agent': 'Shielda-Node/1.0.0',
          },
          timeout: this.timeout,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve({ success: false, error_codes: ['invalid-json-response'] });
            }
          });
        }
      );

      req.on('error', (err) => {
        resolve({ success: false, error_codes: ['http-connection-error'], error_message: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error_codes: ['timeout'] });
      });

      req.write(dataString);
      req.end();
    });
  }

  /**
   * Express middleware for automatic captcha verification.
   * @param {Object} [options]
   * @param {string} [options.fieldName='darban-captcha-response']
   * @param {string} [options.errorMessage='کد امنیتی کپچا نامعتبر است.']
   */
  middleware({ fieldName = 'darban-captcha-response', errorMessage = 'کد امنیتی کپچا نامعتبر است.' } = {}) {
    return async (req, res, next) => {
      const token = req.body?.[fieldName] || req.query?.[fieldName] || req.headers[fieldName];
      const remoteIp = req.ip || req.connection?.remoteAddress;

      const isValid = await this.verify(token, remoteIp);
      if (!isValid) {
        return res.status(400).json({ error: errorMessage, code: 'CAPTCHA_FAILED' });
      }

      next();
    };
  }

  /**
   * Get script tag string.
   */
  getScriptTag() {
    return `<script src="${this.widgetUrl}" async defer></script>`;
  }

  /**
   * Get widget HTML container string.
   */
  getWidgetTag({ theme = 'auto', lang = 'fa' } = {}) {
    return `<div class="darban-captcha" data-sitekey="${this.siteKey}" data-theme="${theme}" data-lang="${lang}"></div>`;
  }
}

module.exports = { Shielda };
