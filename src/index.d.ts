export interface ShieldaOptions {
  siteKey: string;
  secretKey: string;
  verifyUrl?: string;
  widgetUrl?: string;
  timeout?: number;
}

export interface ShieldaVerifyResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
  [key: string]: any;
}

export class Shielda {
  siteKey: string;
  secretKey: string;
  verifyUrl: string;
  widgetUrl: string;
  timeout: number;

  constructor(options: ShieldaOptions);

  verify(token: string, remoteIp?: string): Promise<boolean>;
  verifyWithDetails(token: string, remoteIp?: string): Promise<ShieldaVerifyResult>;
  middleware(options?: { fieldName?: string; errorMessage?: string }): (req: any, res: any, next: any) => Promise<any>;
  getScriptTag(): string;
  getWidgetTag(options?: { theme?: string; lang?: string }): string;
}
