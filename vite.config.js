import { defineConfig } from 'vite';
import { resolve } from 'path'

export default defineConfig(({mode})=>{
    return {
        publicDir: false,
        build: {
            
            lib: {
                entry: resolve(__dirname, 'src/index.ts'),
                name: 'Cambrian',
                formats: ['es','umd'],
                fileName: 'cambrian'

            },
            outDir: 'dist',
        }
    }
});