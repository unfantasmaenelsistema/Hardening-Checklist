const test = require('node:test');
const assert = require('node:assert');
const H = require('../data.js');

const all = [...H.allItems('windows'), ...H.allItems('linux')];

test('40 medidas por sistema e ids únicos', () => {
  assert.strictEqual(H.allItems('windows').length, 40);
  assert.strictEqual(H.allItems('linux').length, 40);
  assert.strictEqual(new Set(all.map((i) => i.id)).size, all.length);
});

test('cada medida tiene criticidad válida, textos ES/EN y comando', () => {
  for (const it of all) {
    assert.ok(H.CRITS.includes(it.crit), `${it.id}: criticidad ${it.crit}`);
    for (const lang of ['es', 'en']) assert.ok(it[lang].title && it[lang].desc, `${it.id}: falta texto ${lang}`);
    assert.ok(it.cmd && it.cmd.trim(), `${it.id}: sin comando`);
    assert.ok(it.cat.es && it.cat.en, `${it.id}: categoría sin traducir`);
  }
});

test('sin títulos repetidos dentro de cada sistema', () => {
  for (const os of ['windows', 'linux']) {
    const titles = H.allItems(os).map((i) => i.es.title.toLowerCase());
    assert.strictEqual(new Set(titles).size, titles.length, `${os}: títulos repetidos`);
  }
});

test('no se cuelan prácticas peligrosas u obsoletas', () => {
  const cmds = all.map((i) => `${i.id}: ${i.cmd}`);
  const forbidden = [
    [/pam_unix\.so[^\n]*nullok/, 'nullok permite contraseñas vacías'],
    [/ChallengeResponseAuthentication/, 'obsoleto desde OpenSSH 8.7'],
    [/apt-key add/, 'apt-key está obsoleto'],
    [/pam_tally2/, 'pam_tally2 ya no existe'],
    [/WMIC/i, 'WMIC está retirado'],
    [/Update-AdmPwdADSchema/, 'LAPS antiguo'],
    [/-Enable [^\n]*\bASLR\b/, 'ASLR no es un nombre de mitigación válido'],
    [/SAM" \/inheritance:r/, 'quitar la herencia a SAM rompe el sistema'],
  ];
  for (const [re, why] of forbidden) {
    const hit = cmds.find((c) => re.test(c));
    assert.ok(!hit, `${why} → ${hit}`);
  }
});

test('el firewall por defecto deniega solo después de permitir SSH', () => {
  const l9 = all.find((i) => i.id === 'l9').cmd;
  assert.ok(l9.indexOf('dport 22 accept') < l9.indexOf('policy drop'));
});

test('filtros y progreso', () => {
  const cat = H.DATA.linux[0].cat;
  const it = H.DATA.linux[0].items[0];
  assert.ok(H.matches(it, cat, 'es', 'PermitRootLogin', new Set()));      // busca también en el comando
  assert.ok(H.matches(it, cat, 'es', 'root login', new Set()));           // y en el texto en inglés
  assert.ok(!H.matches(it, cat, 'es', '', new Set(['Baja'])));
  assert.deepStrictEqual(H.progress('linux', { l1: true, l9: true }), { done: 2, total: 40, pct: 5 });
});
