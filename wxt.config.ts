import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'


export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    "name": "WTab",
    "description": "WTab看板",
    permissions: [
      "bookmarks",
      "tabs",
      "storage"
    ],
    host_permissions: [
      '*://*.wtab.cn/*',
      'chrome://newtab/*',
      'http://localhost:5173/*'
    ],
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
      AutoImport({
        imports: ['vue'],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      ElementPlus({
        // options
      }),
    ] as (Plugin | Plugin[] | Promise<Plugin | Plugin[]>)[],
  }),
});
