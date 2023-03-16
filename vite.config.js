import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import {join} from 'path'
// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  const env = loadEnv(mode, process.cwd(),'VITE_APP_NODE_ENV')
  return{
    plugins: [vue()],
    resolve: {
      alias: {
        '@': join(__dirname,'/src'),
      }
    },
    server: {
      port: 8878,
      open: true
    }
  }
  if (command === "serve") {
    return {
      // dev 独有配置
    };
  } else {
    // command === 'build'
    return {
      // build 独有配置
    };
  }
});
