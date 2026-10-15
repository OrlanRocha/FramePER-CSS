/**
 * FramePER - Universal Test Runner
 * Executes all test suites in tests/ matching test-*.js
 * Usage: node scripts/run-all-tests.js
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testsDir = path.resolve(__dirname, '..', 'tests');

if (!fs.existsSync(testsDir)) {
    console.error(`❌ Diretório de testes não encontrado: ${testsDir}`);
    process.exit(1);
}

const testFiles = fs.readdirSync(testsDir)
    .filter(file => file.startsWith('test-') && file.endsWith('.js'))
    .sort();

if (testFiles.length === 0) {
    console.warn(`⚠️  Nenhum arquivo de teste encontrado em ${testsDir}`);
    process.exit(0);
}

console.log('='.repeat(60));
console.log(`🚀 Executando ${testFiles.length} suítes de testes do FramePER...`);
console.log('='.repeat(60) + '\n');

let passedCount = 0;
let failedCount = 0;
const failures = [];
const startTime = Date.now();

for (const testFile of testFiles) {
    const testPath = path.join(testsDir, testFile);
    process.stdout.write(`⏳ Executando [${testFile}]... `);

    const suiteStart = Date.now();
    const result = spawnSync(process.execPath, [testPath], {
        cwd: path.resolve(__dirname, '..'),
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: 'test' }
    });
    const suiteDuration = ((Date.now() - suiteStart) / 1000).toFixed(2);

    if (result.status === 0) {
        passedCount++;
        console.log(`✅ PASS (${suiteDuration}s)`);
        if (result.stdout && result.stdout.trim()) {
            const summaryLine = result.stdout.trim().split('\n').pop();
            console.log(`   ↳ ${summaryLine}`);
        }
    } else {
        failedCount++;
        console.log(`❌ FAIL (${suiteDuration}s)`);
        failures.push({
            file: testFile,
            stdout: result.stdout,
            stderr: result.stderr
        });
    }
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n' + '='.repeat(60));
console.log(`📊 RESUMO DA EXECUÇÃO (${totalDuration}s)`);
console.log(`   Total de suítes: ${testFiles.length}`);
console.log(`   ✅ Passaram:      ${passedCount}`);
console.log(`   ❌ Falharam:      ${failedCount}`);
console.log('='.repeat(60));

if (failedCount > 0) {
    console.log('\n❌ DETALHES DAS FALHAS:');
    failures.forEach(({ file, stdout, stderr }) => {
        console.log(`\n--- Falha em: ${file} ---`);
        if (stdout) console.log(`STDOUT:\n${stdout}`);
        if (stderr) console.log(`STDERR:\n${stderr}`);
    });
    process.exit(1);
} else {
    console.log('\n🎉 TODAS AS SUÍTES DE TESTES PASSARAM COM 100% DE SUCESSO!\n');
    process.exit(0);
}
