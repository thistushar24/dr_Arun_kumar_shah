import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getCloudEnv(key: string): Promise<string | undefined> {
  if (process.env[key]) {
    return process.env[key];
  }
  try {
    const cf = await getCloudflareContext({ async: true });
    if (cf?.env && (cf.env as Record<string, string>)[key]) {
      return (cf.env as Record<string, string>)[key];
    }
  } catch {
    // ignore if not running in cloudflare async context
  }
  try {
    const cfSync = getCloudflareContext({ async: false });
    if (cfSync?.env && (cfSync.env as Record<string, string>)[key]) {
      return (cfSync.env as Record<string, string>)[key];
    }
  } catch {
    // ignore
  }
  return undefined;
}
