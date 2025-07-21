const pool = require('../config/db');
const UsuarioModel = require('./models/usuarioModel');
const ProyectoModel = require('./models/proyectoModel');
const TareaModel = require('./models/tareaModel');
const bcrypt = require('bcrypt');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  // Método para registrar tests
  test(name, fn) {
    this.tests.push({ name, fn });
  }

  // Método para ejecutar todos los tests
  async runAll() {
    console.log('\n🚀 Iniciando tests del sistema GestorPro...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
      }
    }

    console.log('\n📊 Resultados:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Total: ${this.tests.length}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 ¡Todos los tests pasaron exitosamente!');
    }
  }

  // Método helper para assertions
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
  }

  assertNotNull(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || 'Value should not be null or undefined');
    }
  }
}

// Instancia del test runner
const testRunner = new TestRunner();

// ============================================
// TESTS DE CONEXIÓN A BASE DE DATOS
// ============================================

testRunner.test('Conexión a base de datos', async () => {
  const client = await pool.connect();
  testRunner.assertNotNull(client, 'No se pudo conectar a la base de datos');
  
  const result = await client.query('SELECT NOW()');
  testRunner.assertNotNull(result.rows[0], 'No se pudo ejecutar query básica');
  
  client.release();
});

testRunner.test('Verificar tablas principales existen', async () => {
  const tablas = ['usuarios', 'roles', 'proyectos', 'tareas'];
  
  for (const tabla of tablas) {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `, [tabla]);
    
    testRunner.assert(
      result.rows[0].exists, 
      `La tabla '${tabla}' no existe en la base de datos`
    );
  }
});

// ============================================
// TESTS DEL MODELO USUARIO
// ============================================

testRunner.test('Crear usuario - datos válidos', async () => {
  const userData = {
    nombre: 'Usuario Test',
    correo: `test_${Date.now()}@example.com`,
    contrasenaHasheada: await bcrypt.hash('password123', 10),
    idRol: 2
  };

  const usuario = await UsuarioModel.crearUsuario(userData);
  
  testRunner.assertNotNull(usuario, 'Usuario no fue creado');
  testRunner.assertEqual(usuario.nombre, userData.nombre, 'Nombre no coincide');
  testRunner.assertEqual(usuario.correo, userData.correo, 'Correo no coincide');
  testRunner.assertNotNull(usuario.id, 'ID del usuario no fue generado');

  // Limpiar datos de test
  await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario.id]);
});

testRunner.test('Buscar usuario por correo', async () => {
  // Crear usuario temporal
  const userData = {
    nombre: 'Usuario Busqueda Test',
    correo: `busqueda_${Date.now()}@example.com`,
    contrasenaHasheada: await bcrypt.hash('password123', 10),
    idRol: 2
  };

  const usuarioCreado = await UsuarioModel.crearUsuario(userData);
  
  // Buscar el usuario
  const usuarioEncontrado = await UsuarioModel.buscarPorCorreo(userData.correo);
  
  testRunner.assertNotNull(usuarioEncontrado, 'Usuario no encontrado');
  testRunner.assertEqual(usuarioEncontrado.correo, userData.correo, 'Correo no coincide');

  // Limpiar datos de test
  await pool.query('DELETE FROM usuarios WHERE id = $1', [usuarioCreado.id]);
});

testRunner.test('Buscar usuario inexistente', async () => {
  const usuario = await UsuarioModel.buscarPorCorreo('noexiste@example.com');
  testRunner.assertEqual(usuario, undefined, 'Debería retornar undefined para usuario inexistente');
});

// ============================================
// TESTS DEL MODELO PROYECTO
// ============================================

testRunner.test('Crear proyecto - datos válidos', async () => {
  // Crear usuario temporal para el test
  const userData = {
    nombre: 'Usuario Proyecto Test',
    correo: `proyecto_${Date.now()}@example.com`,
    contrasenaHasheada: await bcrypt.hash('password123', 10),
    idRol: 2
  };
  const usuario = await UsuarioModel.crearUsuario(userData);

  const proyectoData = {
    id_usuario: usuario.id,
    nombre: 'Proyecto Test',
    descripcion: 'Descripción del proyecto test',
    fecha_inicio: '2025-01-01',
    fecha_fin: '2025-12-31'
  };

  const proyecto = await ProyectoModel.crear(proyectoData);
  
  testRunner.assertNotNull(proyecto, 'Proyecto no fue creado');
  testRunner.assertEqual(proyecto.nombre, proyectoData.nombre, 'Nombre no coincide');
  testRunner.assertEqual(proyecto.descripcion, proyectoData.descripcion, 'Descripción no coincide');
  testRunner.assertNotNull(proyecto.id, 'ID del proyecto no fue generado');

  // Limpiar datos de test
  await pool.query('DELETE FROM proyectos WHERE id = $1', [proyecto.id]);
  await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario.id]);
});

testRunner.test('Listar proyectos por usuario', async () => {
  // Crear usuario temporal
  const userData = {
    nombre: 'Usuario Lista Test',
    correo: `lista_${Date.now()}@example.com`,
    contrasenaHasheada: await bcrypt.hash('password123', 10),
    idRol: 2
  };
  const usuario = await UsuarioModel.crearUsuario(userData);

  // Crear algunos proyectos
  const proyecto1 = await ProyectoModel.crear({
    id_usuario: usuario.id,
    nombre: 'Proyecto 1',
    descripcion: 'Descripción 1',
    fecha_inicio: '2025-01-01',
    fecha_fin: '2025-06-30'
  });

  const proyecto2 = await ProyectoModel.crear({
    id_usuario: usuario.id,
    nombre: 'Proyecto 2',
    descripcion: 'Descripción 2',
    fecha_inicio: '2025-07-01',
    fecha_fin: '2025-12-31'
  });

  // Listar proyectos
  const proyectos = await ProyectoModel.listarPorUsuario(usuario.id);
  
  testRunner.assert(proyectos.length >= 2, 'Debería retornar al menos 2 proyectos');
  
  // Verificar que los proyectos creados están en la lista
  const nombresProyectos = proyectos.map(p => p.nombre);
  testRunner.assert(nombresProyectos.includes('Proyecto 1'), 'Proyecto 1 no encontrado');
  testRunner.assert(nombresProyectos.includes('Proyecto 2'), 'Proyecto 2 no encontrado');

  // Limpiar datos de test
  await pool.query('DELETE FROM proyectos WHERE id_usuario = $1', [usuario.id]);
  await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario.id]);
});

// ============================================
// TESTS DEL MODELO TAREA
// ============================================

testRunner.test('Crear tarea - datos válidos', async () => {
  // Crear usuario y proyecto temporales
  const userData = {
    nombre: 'Usuario Tarea Test',
    correo: `tarea_${Date.now()}@example.com`,
    contrasenaHasheada: await bcrypt.hash('password123', 10),
    idRol: 2
  };
  const usuario = await UsuarioModel.crearUsuario(userData);

  const proyecto = await ProyectoModel.crear({
    id_usuario: usuario.id,
    nombre: 'Proyecto Tarea Test',
    descripcion: 'Proyecto para test de tareas',
    fecha_inicio: '2025-01-01',
    fecha_fin: '2025-12-31'
  });

  const tareaData = {
    id_proyecto: proyecto.id,
    titulo: 'Tarea Test',
    descripcion: 'Descripción de tarea test',
    fecha_vencimiento: '2025-06-30',
    prioridad: 'alta'
  };

  const tarea = await TareaModel.crear(tareaData);
  
  testRunner.assertNotNull(tarea, 'Tarea no fue creada');
  testRunner.assertEqual(tarea.titulo, tareaData.titulo, 'Título no coincide');
  testRunner.assertEqual(tarea.descripcion, tareaData.descripcion, 'Descripción no coincide');
  testRunner.assertEqual(tarea.prioridad, tareaData.prioridad, 'Prioridad no coincide');
  testRunner.assertNotNull(tarea.id, 'ID de la tarea no fue generado');

  // Limpiar datos de test
  await pool.query('DELETE FROM tareas WHERE id = $1', [tarea.id]);
  await pool.query('DELETE FROM proyectos WHERE id = $1', [proyecto.id]);
  await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario.id]);
});

testRunner.test('Listar tareas por proyecto', async () => {
  // Crear usuario y proyecto temporales
  const userData = {
    nombre: 'Usuario Tareas Lista Test',
    correo: `tareas_lista_${Date.now()}@example.com`,
    contrasenaHasheada: await bcrypt.hash('password123', 10),
    idRol: 2
  };
  const usuario = await UsuarioModel.crearUsuario(userData);

  const proyecto = await ProyectoModel.crear({
    id_usuario: usuario.id,
    nombre: 'Proyecto Lista Tareas Test',
    descripcion: 'Proyecto para test de lista de tareas',
    fecha_inicio: '2025-01-01',
    fecha_fin: '2025-12-31'
  });

  // Crear varias tareas
  await TareaModel.crear({
    id_proyecto: proyecto.id,
    titulo: 'Tarea 1',
    descripcion: 'Primera tarea',
    fecha_vencimiento: '2025-03-30',
    prioridad: 'alta'
  });

  await TareaModel.crear({
    id_proyecto: proyecto.id,
    titulo: 'Tarea 2',
    descripcion: 'Segunda tarea',
    fecha_vencimiento: '2025-06-30',
    prioridad: 'media'
  });

  // Listar tareas
  const tareas = await TareaModel.listarPorProyecto(proyecto.id);
  
  testRunner.assert(tareas.length >= 2, 'Debería retornar al menos 2 tareas');
  
  // Verificar que las tareas están ordenadas por fecha de vencimiento
  testRunner.assert(
    new Date(tareas[0].fecha_vencimiento) <= new Date(tareas[1].fecha_vencimiento),
    'Las tareas deberían estar ordenadas por fecha de vencimiento'
  );

  // Limpiar datos de test
  await pool.query('DELETE FROM tareas WHERE id_proyecto = $1', [proyecto.id]);
  await pool.query('DELETE FROM proyectos WHERE id = $1', [proyecto.id]);
  await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario.id]);
});

// ============================================
// TESTS DE VALIDACIÓN DE DATOS
// ============================================

testRunner.test('Validación de correo duplicado', async () => {
  const correoTest = `duplicado_${Date.now()}@example.com`;
  
  // Crear primer usuario
  const userData1 = {
    nombre: 'Usuario 1',
    correo: correoTest,
    contrasenaHasheada: await bcrypt.hash('password123', 10),
    idRol: 2
  };
  
  const usuario1 = await UsuarioModel.crearUsuario(userData1);
  testRunner.assertNotNull(usuario1, 'Primer usuario no fue creado');

  // Intentar crear segundo usuario con mismo correo
  const userData2 = {
    nombre: 'Usuario 2',
    correo: correoTest,
    contrasenaHasheada: await bcrypt.hash('password456', 10),
    idRol: 2
  };

  try {
    await UsuarioModel.crearUsuario(userData2);
    throw new Error('Debería haber fallado por correo duplicado');
  } catch (error) {
    testRunner.assert(
      error.message.includes('duplicate') || error.message.includes('unique'),
      'Error debe ser por constraint de unicidad'
    );
  }

  // Limpiar datos de test
  await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario1.id]);
});

// ============================================
// TESTS DE RENDIMIENTO BÁSICO
// ============================================

testRunner.test('Rendimiento - Crear 10 usuarios', async () => {
  const startTime = Date.now();
  const usuariosCreados = [];

  for (let i = 0; i < 10; i++) {
    const userData = {
      nombre: `Usuario Performance ${i}`,
      correo: `performance_${i}_${Date.now()}@example.com`,
      contrasenaHasheada: await bcrypt.hash('password123', 10),
      idRol: 2
    };

    const usuario = await UsuarioModel.crearUsuario(userData);
    usuariosCreados.push(usuario.id);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  testRunner.assert(duration < 5000, `Crear 10 usuarios tomó ${duration}ms, debería ser < 5000ms`);

  // Limpiar datos de test
  for (const userId of usuariosCreados) {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [userId]);
  }
});

// ============================================
// FUNCIÓN PRINCIPAL PARA EJECUTAR TESTS
// ============================================

async function ejecutarTests() {
  try {
    await testRunner.runAll();
  } catch (error) {
    console.error('❌ Error ejecutando tests:', error);
  } finally {
    // Cerrar conexión a la base de datos
    await pool.end();
    process.exit(testRunner.failed > 0 ? 1 : 0);
  }
}

// Ejecutar tests si este archivo se ejecuta directamente
if (require.main === module) {
  ejecutarTests();
}

module.exports = { TestRunner, testRunner, ejecutarTests };
