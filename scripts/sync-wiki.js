/**
 * Script de sincronização automática entre a pasta wiki/ e o GitHub Wiki (FramePER.wiki.git)
 * Uso: npm run wiki:sync
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WIKI_DIR = path.resolve(__dirname, '../wiki');
const TMP_DIR = path.resolve(__dirname, '../.tmp-wiki');
const WIKI_REMOTE = 'https://github.com/OrlanRocha/FramePER.wiki.git';

function run(cmd, cwd) {
  return execSync(cmd, { cwd: cwd || process.cwd(), stdio: 'pipe' }).toString().trim();
}

console.log('🔄 Verificando status do repositório Wiki do GitHub...');

// 1. Testa se o repositório remoto existe
try {
  run(`git ls-remote ${WIKI_REMOTE}`);
} catch (err) {
  console.log('\n=============================================================');
  console.log('⚠️  O REPOSITÓRIO DO WIKI AINDA NÃO FOI INICIALIZADO NO GITHUB');
  console.log('=============================================================');
  console.log('\nO GitHub só cria o repositório Git do Wiki após a primeira página ser criada via web.');
  console.log('\nSiga estes passos rápidos:');
  console.log(' 1. Acesse: https://github.com/OrlanRocha/FramePER/wiki');
  console.log(' 2. Clique no botão verde "Create the first page"');
  console.log(' 3. Cole o conteúdo de "wiki/Home.md" e clique em "Save Page"');
  console.log(' 4. Execute novamente: npm run wiki:sync\n');
  console.log('Após isso, este script sincronizará todas as 11 páginas automaticamente!\n');
  process.exit(0);
}

console.log('✅ Repositório Wiki ativo! Iniciando sincronização...');

// 2. Limpa pasta temporária anterior se existir
if (fs.existsSync(TMP_DIR)) {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
}

try {
  // 3. Clona o repositório do Wiki
  console.log(`📦 Clonando ${WIKI_REMOTE}...`);
  run(`git clone ${WIKI_REMOTE} "${TMP_DIR}"`);

  // 4. Copia os arquivos da pasta wiki/
  console.log('📋 Copiando arquivos markdown da documentação...');
  const files = fs.readdirSync(WIKI_DIR);
  let count = 0;
  for (const file of files) {
    if (file.endsWith('.md')) {
      const srcPath = path.join(WIKI_DIR, file);
      const destPath = path.join(TMP_DIR, file);
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  console.log(`📄 ${count} páginas preparadas para publicação.`);

  // 5. Commit e Push
  console.log('🚀 Enviando atualizações para o GitHub Wiki...');
  run('git config user.name "OrlanRocha"', TMP_DIR);
  run('git config user.email "orlanrocha@users.noreply.github.com"', TMP_DIR);
  run('git add .', TMP_DIR);
  
  try {
    run('git commit -m "docs(wiki): sync complete documentation v2.26.0"', TMP_DIR);
    run('git push origin HEAD', TMP_DIR);
    console.log('\n🎉 SUCESSO! O GitHub Wiki foi atualizado e publicado com sucesso!');
    console.log('🔗 Veja sua wiki online em: https://github.com/OrlanRocha/FramePER/wiki\n');
  } catch (commitErr) {
    if (commitErr.message && commitErr.message.includes('nothing to commit')) {
      console.log('✨ A wiki já está 100% atualizada com a versão local.');
    } else {
      throw commitErr;
    }
  }
} catch (error) {
  console.error('❌ Erro durante a sincronização:', error.message);
} finally {
  // 6. Limpeza
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
}
