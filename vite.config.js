import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  // 判断是否为生产环境
  const isProduction = command === 'build'
  
  return {
    // 插件配置
    plugins: [
      vue(),
      
      // 自动导入 Vue 相关 API
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: [
          'vue',
          'vue-router',
          'vuex',
          {
            'element-plus': ['ElMessage', 'ElMessageBox', 'ElNotification']
          }
        ],
        dts: false,
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true
        }
      }),
      
      // 自动导入组件
      Components({
        resolvers: [ElementPlusResolver()],
        dts: false
      })
    ],
    
    // 路径解析配置
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@config': resolve(__dirname, 'src/config'),
        '@services': resolve(__dirname, 'src/services')
      }
    },
    
    // CSS 配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variables.scss" as *;`
        }
      }
    },
    
    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: false,
      cors: true,
      
      // 代理配置
      proxy: {
        '/api': {
          target: env.VITE_APP_SERVER_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    
    // 预览服务器配置
    preview: {
      host: '0.0.0.0',
      port: 4173,
      open: false
    },
    
    // 构建配置
    build: {
      outDir: 'build',
      assetsDir: 'assets',
      sourcemap: mode === 'local',
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      
      // Rollup 配置
      rollupOptions: {
        output: {
          // 手动分包
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'vuex'],
            'element-plus': ['element-plus'],
            'utils': ['axios', 'dayjs', 'crypto-js']
          },
          
          // 静态资源文件命名
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            let extType = info[info.length - 1]
            
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'media'
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = 'images'
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'fonts'
            }
            
            return `${extType}/[name]-[hash].[ext]`
          }
        }
      }
    },
    
    // 优化配置
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'vuex',
        'element-plus',
        'axios',
        'dayjs',
        'crypto-js'
      ]
    },
    
    // 全局变量定义
    define: {
      __VUE_PROD_DEVTOOLS__: !isProduction,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: !isProduction,
      __VUE_OPTIONS_API__: true
    },
    
    // 基础路径配置
    base: env.VITE_APP_BASE_URL || '/',
    
    // 环境变量前缀
    envPrefix: 'VITE_APP_'
  }
}) 