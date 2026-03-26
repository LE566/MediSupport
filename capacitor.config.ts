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
      backgroundColor: "#145da0",
      navigationBarColor: "#145da0",
      statusBarColor: "#145da0",
    },
  },
};

export default config;
