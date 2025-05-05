export interface AppConfig {
  GOOGLE_CALENDAR_API_KEY: string;
  GOOGLE_CALENDAR_ID: string;
}

let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (config) return config;
  const response = await fetch('/config.json');
  if (!response.ok) throw new Error('Не удалось загрузить конфиг');
  config = await response.json();
  return config;
} 