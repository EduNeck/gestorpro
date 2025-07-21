const pool = require('../config/db');

async function verificarYCorregirTablaProyectos() {
  console.log('🔍 Verificando estructura de la tabla proyectos...');
  
  try {
    // Verificar las columnas actuales
    const columnasResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'proyectos' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Columnas actuales en la tabla proyectos:');
    columnasResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });

    // Verificar si fecha_creacion existe y su tipo
    const fechaCreacionCol = columnasResult.rows.find(col => col.column_name === 'fecha_creacion');
    
    if (!fechaCreacionCol) {
      console.log('\n⚠️  La columna fecha_creacion no existe. Agregándola...');
      await pool.query(`
        ALTER TABLE proyectos 
        ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✅ Columna fecha_creacion agregada exitosamente.');
    } else if (fechaCreacionCol.data_type === 'time without time zone') {
      console.log('\n⚠️  La columna fecha_creacion tiene tipo incorrecto (time). Corrigiendo...');
      
      // Primero eliminar la columna incorrecta
      await pool.query(`ALTER TABLE proyectos DROP COLUMN fecha_creacion;`);
      
      // Agregar la columna con el tipo correcto
      await pool.query(`
        ALTER TABLE proyectos 
        ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      
      console.log('✅ Columna fecha_creacion corregida exitosamente.');
    } else {
      console.log('\n✅ La columna fecha_creacion ya existe con el tipo correcto.');
    }

    // Actualizar registros existentes que no tengan fecha_creacion
    const updateResult = await pool.query(`
      UPDATE proyectos 
      SET fecha_creacion = CURRENT_TIMESTAMP 
      WHERE fecha_creacion IS NULL;
    `);

    if (updateResult.rowCount > 0) {
      console.log(`✅ Se actualizaron ${updateResult.rowCount} registros con fecha_creacion.`);
    }

    console.log('\n🎉 Verificación completada exitosamente.');

  } catch (error) {
    console.error('❌ Error al verificar la tabla:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
  verificarYCorregirTablaProyectos();
}

module.exports = { verificarYCorregirTablaProyectos };
