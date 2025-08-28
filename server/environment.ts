// Environment detection and configuration
export function isProductionEnvironment(req?: any): boolean {
  // Check various indicators for production/deployed environment
  const nodeEnv = process.env.NODE_ENV;
  const host = req?.get('host') || req?.headers?.host || process.env.HOST || '';
  
  // Production indicators
  const isProduction = nodeEnv === 'production';
  const isReplitApp = host.includes('.replit.app') || host.includes('band-blaze-durantoss');
  const hasDemoModeEnv = process.env.DEMO_MODE === 'true';
  
  console.log('Environment detection:', {
    nodeEnv,
    host,
    isProduction,
    isReplitApp,
    hasDemoModeEnv
  });
  
  return isProduction || isReplitApp || hasDemoModeEnv;
}

export function shouldUseDemoMode(req?: any): boolean {
  const isProd = isProductionEnvironment(req);
  console.log('Demo mode decision:', { isProd, willUseDemoMode: isProd });
  return isProd;
}