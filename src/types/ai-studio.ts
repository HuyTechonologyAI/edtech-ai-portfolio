export interface GatewayResult {
  text?: string;
  error?: string;
  meta?: { providerUsed?: string; providerName?: string; failoversOccurred?: string[]; modelUsed?: string; fallbackAttempts?: number; latencyMs?: number };
}

export interface StudioResult extends GatewayResult {
  package?: {
    topic?: string;
    marpSlideCode?: string;
    lessonPlan?: string;
    comfyUiPrompts?: string[];
    vietTtsScript?: string;
    moneyPrinterTurboStoryboard?: { scene: number; durationSec: number; script: string; visualKeyword: string }[];
    sadTalkerTeacherScript?: string;
  };
}
