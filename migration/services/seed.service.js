/**
 * Seed Service
 * Ensures basic required data exists before migration
 */

const logger = require('../utils/logger');

/**
 * Ensures school and cooperative exist in database
 * @param {Object} client - Database client
 * @param {number} cooperativeId - Expected cooperative ID
 * @returns {Promise<void>}
 */
async function ensureBasicData(client, cooperativeId) {
    logger.step('🏫 Verificando datos básicos (escuela y cooperativa)...');

    try {
        // Check if school exists
        const schoolCheck = await client.query('SELECT school_id FROM schools WHERE school_id = 1');

        if (schoolCheck.rows.length === 0) {
            logger.info('Escuela no encontrada, creando...');
            await client.query(`
                INSERT INTO schools (school_id, name, created_at, updated_at)
                VALUES (1, 'Escuela Los Chiles Aguas Zarcas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `);
            logger.success('Escuela creada: Escuela Los Chiles Aguas Zarcas');
        } else {
            logger.info('Escuela encontrada: ' + schoolCheck.rows[0].school_id);
        }

        // Check if cooperative exists
        const coopCheck = await client.query(
            'SELECT cooperative_id, trade_name FROM cooperatives WHERE cooperative_id = $1',
            [cooperativeId]
        );

        if (coopCheck.rows.length === 0) {
            logger.info('Cooperativa no encontrada, creando...');
            await client.query(`
                INSERT INTO cooperatives (cooperative_id, school_id, trade_name, legal_name, created_at, updated_at)
                VALUES ($1, 1, 'Coopesuma R.L.', 'Cooperativa Estudiantil Unida Motivando el Ahorro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [cooperativeId]);
            logger.success('Cooperativa creada: Coopesuma R.L.');
        } else {
            logger.info('Cooperativa encontrada: ' + coopCheck.rows[0].trade_name);
        }

        // Check if member_qualities exist
        const qualitiesCheck = await client.query('SELECT COUNT(*) as count FROM member_qualities');

        if (qualitiesCheck.rows[0].count === '0') {
            logger.info('Catálogo de calidades de miembros no encontrado, creando...');
            await client.query(`
                INSERT INTO member_qualities (quality_id, quality_code, quality_name, description, created_at, updated_at) VALUES
                (1, 'student', 'Estudiante', 'Miembro activo que es estudiante de la escuela', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (2, 'staff', 'Funcionario', 'Miembro activo que es funcionario de la escuela (docente, administrativo)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `);
            logger.success('Catálogo de calidades creado');
        } else {
            logger.info('Catálogo de calidades encontrado: ' + qualitiesCheck.rows[0].count + ' registros');
        }

        // Check if member_levels exist
        const levelsCheck = await client.query('SELECT COUNT(*) as count FROM member_levels');

        if (levelsCheck.rows[0].count === '0') {
            logger.info('Catálogo de niveles educativos no encontrado, creando...');
            await client.query(`
                INSERT INTO member_levels (level_id, level_code, level_name, applies_to_quality_code, display_order, created_at, updated_at) VALUES
                (1, 'grade_1', 'Primer Grado', 'student', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (2, 'grade_2', 'Segundo Grado', 'student', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (3, 'grade_3', 'Tercer Grado', 'student', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (4, 'grade_4', 'Cuarto Grado', 'student', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (5, 'grade_5', 'Quinto Grado', 'student', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (6, 'grade_6', 'Sexto Grado', 'student', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (7, 'not_applicable', 'No Aplica', 'staff', 99, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (8, 'transicion', 'Transición', 'student', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (9, 'materno', 'Materno', 'student', -1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `);
            logger.success('Catálogo de niveles educativos creado (incluyendo Transición y Materno)');
        } else {
            logger.info('Catálogo de niveles educativos encontrado: ' + levelsCheck.rows[0].count + ' registros');

            // Verificar si existen Transición y Materno, si no, agregarlos
            const transicionCheck = await client.query('SELECT level_id FROM member_levels WHERE level_code = $1', ['transicion']);
            if (transicionCheck.rows.length === 0) {
                logger.info('Agregando nivel Transición...');
                await client.query(`
                    INSERT INTO member_levels (level_id, level_code, level_name, applies_to_quality_code, display_order, created_at, updated_at)
                    VALUES (8, 'transicion', 'Transición', 'student', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `);
            }

            const maternoCheck = await client.query('SELECT level_id FROM member_levels WHERE level_code = $1', ['materno']);
            if (maternoCheck.rows.length === 0) {
                logger.info('Agregando nivel Materno...');
                await client.query(`
                    INSERT INTO member_levels (level_id, level_code, level_name, applies_to_quality_code, display_order, created_at, updated_at)
                    VALUES (9, 'materno', 'Materno', 'student', -1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `);
            }
        }

        // Check if account_types exist
        const accountTypesCheck = await client.query('SELECT COUNT(*) as count FROM account_types');

        if (accountTypesCheck.rows[0].count === '0') {
            logger.info('Tipos de cuentas no encontrados, creando...');
            await client.query(`
                INSERT INTO account_types (type_code, type_name, description, created_at, updated_at) VALUES
                ('savings', 'Ahorro', 'Cuenta de ahorros del asociado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                ('contributions', 'Aportación', 'Cuenta de aportaciones del asociado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                ('loans', 'Préstamo', 'Cuenta de préstamos del asociado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                ('education', 'Educación', 'Cuenta de educación cooperativa del asociado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `);
            logger.success('Tipos de cuentas creados');
        } else {
            logger.info('Tipos de cuentas encontrados: ' + accountTypesCheck.rows[0].count + ' registros');
        }

        // Check if receipt_number column exists in transactions
        const receiptColumnCheck = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'transactions'
            AND column_name = 'receipt_number'
        `);

        if (receiptColumnCheck.rows.length === 0) {
            logger.info('Columna receipt_number no encontrada en transactions, agregando...');
            await client.query(`
                ALTER TABLE transactions
                ADD COLUMN receipt_number VARCHAR(50)
            `);
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number
                ON transactions(receipt_number)
                WHERE receipt_number IS NOT NULL
            `);
            logger.success('Columna receipt_number agregada a transactions');
        } else {
            logger.info('Columna receipt_number ya existe en transactions');
        }

        // Check if admin user exists (needed for created_by in transactions)
        const userCheck = await client.query('SELECT user_id FROM users WHERE user_id = $1', [1]);

        if (userCheck.rows.length === 0) {
            logger.info('Usuario administrador para migración no encontrado, creando...');
            await client.query(`
                INSERT INTO users (user_id, cooperative_id, full_name, email, role, is_active, created_at, updated_at)
                VALUES (1, $1, 'Kimberly Corrales', 'kicorraleve@est.utn.ac.cr', 'administrator', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [cooperativeId]);
            logger.success('Usuario administrador de migración creado (ID: 1)');
        } else {
            logger.info('Usuario administrador encontrado (ID: 1)');
        }

        logger.success('Datos básicos verificados correctamente');

    } catch (error) {
        logger.error('Error verificando/creando datos básicos: ' + error.message);
        throw error;
    }
}

/**
 * Disables triggers that prevent historical data migration
 * @param {Object} client - Database client
 * @returns {Promise<void>}
 */
async function disableMigrationBlockingTriggers(client) {
    logger.step('🔓 Deshabilitando triggers de validación para migración histórica...');

    try {
        // Disable fiscal year validation trigger
        await client.query(`
            ALTER TABLE transactions DISABLE TRIGGER validate_fiscal_year_trigger
        `);
        logger.success('Trigger de año fiscal deshabilitado (permitirá insertar datos históricos)');

        // Disable member level quality validation trigger (if needed)
        await client.query(`
            ALTER TABLE members DISABLE TRIGGER validate_member_level_quality_trigger
        `);
        logger.success('Trigger de validación de nivel/calidad deshabilitado');

    } catch (error) {
        logger.warning(`Advertencia al deshabilitar triggers: ${error.message}`);
        // No throw - algunos triggers pueden no existir
    }
}

/**
 * Re-enables triggers after migration completes
 * @param {Object} client - Database client
 * @returns {Promise<void>}
 */
async function enableMigrationBlockingTriggers(client) {
    logger.step('🔒 Rehabilitando triggers de validación...');

    try {
        // Re-enable fiscal year validation trigger
        await client.query(`
            ALTER TABLE transactions ENABLE TRIGGER validate_fiscal_year_trigger
        `);
        logger.success('Trigger de año fiscal rehabilitado');

        // Re-enable member level quality validation trigger
        await client.query(`
            ALTER TABLE members ENABLE TRIGGER validate_member_level_quality_trigger
        `);
        logger.success('Trigger de validación de nivel/calidad rehabilitado');

    } catch (error) {
        logger.warning(`Advertencia al rehabilitar triggers: ${error.message}`);
    }
}

module.exports = {
    ensureBasicData,
    disableMigrationBlockingTriggers,
    enableMigrationBlockingTriggers
};
