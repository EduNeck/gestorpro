const bcrypt = require('bcrypt');

(async () => {
  const contrasena = 'admin123';
  const hash = await bcrypt.hash(contrasena, 10);
  console.log('🔐 Hash generado para admin123:', hash);
})();
