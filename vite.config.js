import { defineConfig } from 'vite';
import { resolve } from 'path'

export default defineConfig(()=>{
    return {
        build: {
            lib: {
                entry: resolve(__dirname, 'src/lib/index.ts'),
                name: 'Cambrian',
                formats: ['es','umd'],
                fileName: 'cambrian'

            },
            outDir: 'dist',
        }
    }
});