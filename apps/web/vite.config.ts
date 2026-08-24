import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig, type UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import pkg from './package.json';

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as unknown as {
    dependencies: PkgDep;
    devDependencies: PkgDep;
    [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

export default defineConfig(({ command, mode }): UserConfig => {
    return {
        plugins: [
            tailwindcss(),
            qwikCity(),
            qwikVite(),
            Icons({ compiler: 'qwik' }),
            tsconfigPaths({ root: '.' }),
        ],
        optimizeDeps: {
            exclude: [],
        },

        ssr:
            command === 'build' && mode === 'production'
                ? {
                      noExternal: Object.keys(devDependencies),
                      external: Object.keys(dependencies),
                  }
                : undefined,

        server: {
            headers: {
                'Cache-Control': 'public, max-age=0',
            },
        },
        preview: {
            headers: {
                'Cache-Control': 'public, max-age=600',
            },
        },
    };
});

const qwikRegex = /qwik/i;

function errorOnDuplicatesPkgDeps(devDependencies: PkgDep, dependencies: PkgDep) {
    let msg = '';
    const duplicateDeps = Object.keys(devDependencies).filter((dep) => dependencies[dep]);
    const qwikPkg = Object.keys(dependencies).filter((value) => qwikRegex.test(value));

    msg = `Move qwik packages ${qwikPkg.join(', ')} to devDependencies`;

    if (qwikPkg.length > 0) {
        throw new Error(msg);
    }

    msg = `
    Warning: The dependency "${duplicateDeps.join(', ')}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `;

    if (duplicateDeps.length > 0) {
        throw new Error(msg);
    }
}
