import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.medisupport.starter',
  appName: 'MediSupport+',
  webDir: 'www',
  plugins: {
    "Keyboard":{
      "resizeOnFullScreen":false
    },
    "SystemBars":{
      "insetsHandling":"disable"
    },
    "EdgeToEdge": {
      backgroundColor: "#0b3d6e",
      navigationBarColor: "#0b3d6e",
      statusBarColor: "#0b3d6e",
    },
  },
};

export default config;
