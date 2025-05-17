import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'


export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: "WTab",
    description: "一个简洁、美观、实用的浏览器起始页。",
    permissions: [
      "bookmarks",
      "tabs",
      "storage",
    ],
    host_permissions: [
      "*://*.wtab.cn/*",
      "http://localhost:5173/*"
    ],
    chrome_url_overrides: {
      newtab: "newtab.html"
    },
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
