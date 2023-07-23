import workerLoader from 'rollup-plugin-web-worker-loader';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/clang.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/clang.js',
      format: 'es',
    },
  ],
  plugins: [
    workerLoader(),
    process.env.ENV === 'production' && terser(),
    copy({
      targets: [
        {
          src: 'src/(*.wasm|sysroot.tar)',
          dest: 'dist',
        },
      ],
    }),
    process.env.ENV === 'development' &&
      serve({
        contentBase: './',
        port: 4321,
      }),
  ],
};
