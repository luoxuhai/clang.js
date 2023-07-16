import workerLoader from 'rollup-plugin-web-worker-loader';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/clang.js',
      format: 'es',
    },
  ],
  plugins: [
    workerLoader(),
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
