const pool = require('../config/db');

async function crearRolesIniciales() {
    try {
        console.log('🔧 Creando roles iniciales...');
        
        const rolesIniciales = [
            { nombre: 'Administrador' },
            { nombre: 'Manager' },
            { nombre: 'Usuario' },
            { nombre: 'Invitado' }
        ];

        for (const rol of rolesIniciales) {
            try {
                // Verificar si el rol ya existe
                const existe = await pool.query(
                    'SELECT id FROM roles WHERE nombre = $1',
                    [rol.nombre]
                );

                if (existe.rows.length === 0) {
                    const resultado = await pool.query(
                        'INSERT INTO roles (nombre) VALUES ($1) RETURNING id, nombre',
                        [rol.nombre]
                    );
                    console.log(`✅ Rol "${rol.nombre}" creado con ID: ${resultado.rows[0].id}`);
                } else {
                    console.log(`ℹ️  Rol "${rol.nombre}" ya existe con ID: ${existe.rows[0].id}`);
                }
            } catch (error) {
                console.error(`❌ Error al crear rol "${rol.nombre}":`, error.message);
            }
        }

        console.log('🎉 Proceso de creación de roles completado');
        
        // Mostrar todos los roles existentes
        const todosLosRoles = await pool.query('SELECT * FROM roles ORDER BY id');
        console.log('\n📋 Roles existentes en la base de datos:');
        todosLosRoles.rows.forEach(rol => {
            console.log(`  - ID: ${rol.id} | Nombre: ${rol.nombre}`);
        });

    } catch (error) {
        console.error('❌ Error en el proceso de creación de roles:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    crearRolesIniciales()
        .then(() => {
            console.log('\n✨ Script finalizado exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Error fatal:', error);
            process.exit(1);
        });
}

module.exports = crearRolesIniciales;
