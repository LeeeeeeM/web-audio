// import { resolve } from 'path';
import { defineConfig } from 'vite';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { version } from './package.json';

export default defineConfig({
  plugins: [],
  // 打包配置
  build: {
    // lib: {
    //   formats: ['umd'],
    //   entry: resolve(__dirname, 'src/index.ts'), // 入口
    //   name: '__WEB_AUDIO__', // 安裝、引入用
    //   fileName: (format: string) => `web-audio.${format}.[hash].js`, // 打包后名称
    // },
    emptyOutDir: true,
    outDir: 'lib',
    sourcemap: true, // 输出sourcemap
    rollupOptions: {
      plugins: [
        getBabelOutputPlugin({
          presets: [['@babel/preset-env', { modules: 'umd' }]],
          allowAllFormats: true,
        }),
      ]
    },
  },
});
