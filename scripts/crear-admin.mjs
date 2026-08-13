// Genera el INSERT SQL para crear un administrador del panel.
// Uso:
//   node scripts/crear-admin.mjs usuario "contraseña segura"
// Copia el INSERT que imprime y pégalo en el SQL Editor de Supabase.

import bcrypt from "bcryptjs";

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error('Uso: node scripts/crear-admin.mjs usuario "contraseña"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
const escapedUsername = username.replace(/'/g, "''");

console.log("\nEjecuta esto en el SQL Editor de Supabase:\n");
console.log(
  `insert into admins (username, password_hash) values ('${escapedUsername}', '${hash}');\n`
);
