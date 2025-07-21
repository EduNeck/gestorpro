const pool = require('../config/db');

async function verificarConstraintsTareas() {
  console.log('🔍 Verificando constraints de la tabla tareas...');
  
  try {
    // Verificar constraint de estado en tareas
    const constraintsResult = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'tareas' 
        AND tc.constraint_type = 'CHECK'
        AND tc.constraint_name LIKE '%estado%';
    `);

    console.log('\n📋 Constraints CHECK para estado en tareas:');
    constraintsResult.rows.forEach(constraint => {
      console.log(`- ${constraint.constraint_name}: ${constraint.check_clause}`);
    });

    // Verificar constraint de prioridad en tareas
    const prioridadResult = await pool.query(`
      SELECT 
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'tareas' 
        AND tc.constraint_type = 'CHECK'
        AND tc.constraint_name LIKE '%prioridad%';
    `);

    console.log('\n📋 Constraints CHECK para prioridad en tareas:');
    prioridadResult.rows.forEach(constraint => {
      console.log(`- ${constraint.constraint_name}: ${constraint.check_clause}`);
    });

    // Verificar datos existentes
    const estadosResult = await pool.query(`
      SELECT estado, COUNT(*) as count
      FROM tareas 
      GROUP BY estado
      ORDER BY count DESC;
    `);

    console.log('\n📊 Estados actuales en la tabla tareas:');
    if (estadosResult.rows.length > 0) {
      estadosResult.rows.forEach(row => {
        console.log(`- ${row.estado}: ${row.count} tareas`);
      });
    } else {
      console.log('- No hay tareas en la base de datos');
    }

    // Verificar prioridades existentes
    const prioridadesResult = await pool.query(`
      SELECT prioridad, COUNT(*) as count
      FROM tareas 
      GROUP BY prioridad
      ORDER BY count DESC;
    `);

    console.log('\n📊 Prioridades actuales en la tabla tareas:');
    if (prioridadesResult.rows.length > 0) {
      prioridadesResult.rows.forEach(row => {
        console.log(`- ${row.prioridad}: ${row.count} tareas`);
      });
    } else {
      console.log('- No hay tareas con prioridades definidas');
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error al verificar constraints:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  verificarConstraintsTareas();
}

module.exports = { verificarConstraintsTareas };
