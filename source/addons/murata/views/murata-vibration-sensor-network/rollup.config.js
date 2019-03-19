import angular from 'rollup-plugin-angular';
import virtual from 'rollup-plugin-virtual';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';

const files = __dirname.split('/');
const viewName = files.pop();
// files.pop();
// const parentName = files.pop();

export default [{
  input: `src/main.ts`,
  output: {
    // file: `dist/${viewName}.bundle.js`,
    file: `../../../../console/src/assets/${viewName}.bundle.js`,
    format: 'umd',
    name: viewName,
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        'rxjs': 'Rx'
    }
  },
  plugins: [
    angular(),
//     virtual({
//         'rxjs/operators': `
//      import rxjs from 'rxjs';
//      export const { Subject } = rxjs.Subject;
//      export const {filter, map, concatMap, tap, share} = rxjs.operators;
//   `
//     }),
    resolve({
      jsnext: true,
      main: true,
      // pass custom options to the resolve plugin
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    typescript({
      typescript: require('typescript')
    }),
    // commonjs()
    commonjs({
        include: "node_modules/**",
    })
  ],
  external: [
    '@angular/core',
    '@angular/common',
    '@sputnik-addon-iot/component',
    '@sputnik-addon-iot/service',
    '@sputnik-addon-iot/module',
    'rxjs'
  ]
}]
