import { watch } from 'fs';
import { join } from 'path';

const projectRoot = join(import.meta.dir, '../');

async function buildClient() {
  console.log('Building client...');
  const result = await Bun.build({
    entrypoints: [join(projectRoot, 'client/src/index.tsx')],
    outdir: join(projectRoot, 'client/public/js'),
    naming: 'bundle.js',
    minify: false,
    sourcemap: 'external',
  });
  
  if (!result.success) {
    console.error('❌ Build failed:', result.logs);
  } else {
    console.log('✅ Client bundle created at:', join(projectRoot, 'client/public/js/bundle.js'));
  }
}

// Initial build
await buildClient();

// Watch for changes
console.log('👀 Watching for changes in:', join(projectRoot, 'client/src'));
watch(join(projectRoot, 'client/src'), { recursive: true }, async (event, filename) => {
  console.log(`📝 File changed: ${filename}`);
  await buildClient();
});