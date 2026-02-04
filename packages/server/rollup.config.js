import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import env from 'env'

env.init()

const extensions = ['.js']

const envReplacements = {
  preventAssignment: true,
  'process.env.NODE_ENV': env.get('NODE_ENV', 'development'),
}

const createPlugins = () => [resolve.default({ extensions }), replace.default(envReplacements)]

const config = [
  {
    input: 'src/frontend/main.js',
    output: {
      file: 'src/frontend/public/main.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: createPlugins(),
  },
]

export default config
