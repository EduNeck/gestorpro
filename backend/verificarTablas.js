const pool = require('./config/db');

async function verificarEstructuraTablas() {
  try {
    console.log('🔍 Verificando estructura de las tablas...\n');

    // Verificar que la tabla proyectos existe
    const tablaExiste = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'proyectos'
      );
    `);
    
    console.log('✅ Tabla proyectos existe:', tablaExiste.rows[0].exists);

    if (tablaExiste.rows[0].exists) {
      // Obtener información sobre las columnas de la tabla proyectos
      const columnas = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'proyectos'
        ORDER BY ordinal_position;
      `);

      console.log('\n📋 Estructura de la tabla proyectos:');
      console.log('Columna | Tipo | Nullable | Default');
      console.log('--------|------|----------|--------');
      
      columnas.rows.forEach(col => {
        console.log(`${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || 'N/A'}`);
      });

      // Verificar si hay registros
      const count = await pool.query('SELECT COUNT(*) FROM proyectos');
      console.log(`\n📊 Total de registros en proyectos: ${count.rows[0].count}`);
    }

    // También verificar tabla tareas
    const tablaExisteTareas = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tareas'
      );
    `);
    
    console.log('\n✅ Tabla tareas existe:', tablaExisteTareas.rows[0].exists);

    if (tablaExisteTareas.rows[0].exists) {
      const columnasTareas = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'tareas'
        ORDER BY ordinal_position;
      `);

      console.log('\n📋 Columnas de la tabla tareas:');
      columnasTareas.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    }

    // Verificar tabla usuarios
    const tablaExisteUsuarios = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'usuarios'
      );
    `);
    
    console.log('\n✅ Tabla usuarios existe:', tablaExisteUsuarios.rows[0].exists);

  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEstructuraTablas();
