// Configuration Remotion — s'applique uniquement au Studio et au rendu en local.
// Doc : https://www.remotion.dev/docs/config
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind-v4';

// Qualité d'image des frames pendant le rendu.
Config.setVideoImageFormat('jpeg');

// Active TailwindCSS v4 dans le bundler Remotion.
Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});
