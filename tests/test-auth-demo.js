const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Testando Integração da Suíte de Autenticação FramePER ---');

// 1. Verificar existência de auth.html
const authPath = path.join(__dirname, '..', 'demo', 'auth.html');
assert(fs.existsSync(authPath), 'demo/auth.html deve existir');
const authHtml = fs.readFileSync(authPath, 'utf8');

// 2. Verificar Views
const requiredViews = ['viewLogin', 'viewRegister', 'viewForgot', 'viewOtp', 'viewReset'];
requiredViews.forEach(viewId => {
  assert(authHtml.includes(`id="${viewId}"`), `auth.html deve conter a view com id="${viewId}"`);
});
console.log('✔ Todas as 5 views (Login, Register, Forgot, OTP, Reset) estão presentes.');

// 3. Verificar OTP Input Group
assert(authHtml.includes('class="otp-input-group"'), 'Deve conter .otp-input-group');
const otpDigitsCount = (authHtml.match(/class="otp-digit"/g) || []).length;
assert.strictEqual(otpDigitsCount, 6, 'Deve conter exatamente 6 campos .otp-digit');
console.log('✔ Componente nativo .otp-input-group com 6 dígitos configurado.');

// 4. Verificar Força de Senha e Toggle de Senha
assert(authHtml.includes('id="regStrengthMeter"'), 'Deve conter medidor de força da senha');
assert(authHtml.includes('data-toggle-pass'), 'Deve conter botões de alternar visibilidade de senha');
console.log('✔ Medidor de força de senha e toggles de visibilidade configurados.');

// 5. Verificar Split Screen e Tema
assert(authHtml.includes('auth-split-wrapper'), 'Deve conter .auth-split-wrapper');
assert(authHtml.includes('auth-brand-side'), 'Deve conter .auth-brand-side');
assert(authHtml.includes('auth-form-side'), 'Deve conter .auth-form-side');
assert(authHtml.includes('data-theme-toggle'), 'Deve conter alternador de tema claro/escuro');
console.log('✔ Layout Split Screen e seletor de tema presentes.');

// 6. Verificar Integração com Dashboard
const dashPath = path.join(__dirname, '..', 'demo', 'dashboard.html');
const dashHtml = fs.readFileSync(dashPath, 'utf8');
assert(dashHtml.includes('href="auth.html"'), 'dashboard.html deve ter link para auth.html na sidebar');
assert(dashHtml.includes('href="auth.html?logout=true"'), 'dashboard.html deve apontar logout para auth.html?logout=true');
console.log('✔ dashboard.html integrado com link direto e rota de logout.');

// 7. Verificar Index.html
const indexPath = path.join(__dirname, '..', 'demo', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
assert(indexHtml.includes('href="auth.html"'), 'index.html deve conter link para auth.html');
console.log('✔ index.html atualizado com acesso rápido à autenticação.');

// 8. Verificar demais telas do dashboard (users, messages, reports, settings)
const otherPages = ['users.html', 'messages.html', 'reports.html', 'settings.html'];
otherPages.forEach(page => {
  const pagePath = path.join(__dirname, '..', 'demo', page);
  const content = fs.readFileSync(pagePath, 'utf8');
  assert(content.includes('href="auth.html"'), `${page} deve conter link para auth.html na sidebar`);
  assert(content.includes('href="auth.html?logout=true"'), `${page} deve apontar logout para auth.html?logout=true`);
});
console.log('✔ Todas as demais páginas do dashboard (users, messages, reports, settings) integradas.');

// 9. Verificar Correções Críticas (Status Pip, Form OTP, Hash Navigation)
assert(authHtml.includes('status-pip'), 'auth.html deve conter .status-pip dentro de .status-dot');
assert(authHtml.includes('id="formOtp"'), 'auth.html deve conter form#formOtp para envio com Enter');
assert(authHtml.includes('hashchange'), 'auth.html deve ouvir evento hashchange para navegação segura no histórico');
console.log('✔ Correções visuais e de navegação (status-pip, formOtp, hashchange) validadas.');

console.log('----------------------------------------------------');
console.log('🎉 TODOS OS TESTES DE INTEGRAÇÃO PASSARAM COM SUCESSO!');

