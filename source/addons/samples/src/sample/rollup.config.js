import angular from 'rollup-plugin-angular';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';

const name = __dirname.split('/').pop();

export default [{
    input: 'src/main.ts',
    output: {
        file: `../../compiled-views/${name}.bundle.js`,
        format: 'umd',
        name: name,
    },
    plugins: [
        angular(),
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
        commonjs()
    ],
    external: [
        '@angular/core',
        '@angular/common',
        'aws-amplify',
        'aws-amplify-angular'
    ]
}]
