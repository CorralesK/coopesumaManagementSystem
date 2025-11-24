/**
 * Clean Migration Data
 * Deletes all migrated data to allow re-running migration
 */

require('dotenv').config();
const chalk = require('chalk');
const { getClient, pool } = require('./config/database');
const logger = require('./utils/logger');

const COOPERATIVE_ID = parseInt(process.env.COOPERATIVE_ID) || 1;

async function cleanMigrationData() {
    logger.header('🗑️  LIMPIANDO DATOS DE MIGRACIÓN ANTERIOR');

    console.log(chalk.yellow('\n⚠️  ADVERTENCIA: Este script eliminará todos los datos migrados.'));
    console.log(chalk.yellow('   - Todas las transacciones'));
    console.log(chalk.yellow('   - Todas las cuentas'));
    console.log(chalk.yellow('   - Todos los miembros de la cooperativa'));
    console.log(chalk.white('\nEsto NO eliminará:'));
    console.log(chalk.white('   - Estructura de la base de datos (tablas, triggers, funciones)'));
    console.log(chalk.white('   - Catálogos (member_qualities, member_levels, account_types)'));
    console.log(chalk.white('   - Datos de escuela y cooperativa'));

    let client;

    try {
        client = await getClient();
        await client.query('BEGIN');

        logger.step('🗑️  Eliminando transacciones...');
        const txResult = await client.query(`
            DELETE FROM transactions
            WHERE account_id IN (
                SELECT account_id FROM accounts WHERE cooperative_id = $1
            )
        `, [COOPERATIVE_ID]);
        logger.success(`${txResult.rowCount} transacciones eliminadas`);

        logger.step('🗑️  Eliminando cuentas...');
        const accResult = await client.query(`
            DELETE FROM accounts WHERE cooperative_id = $1
        `, [COOPERATIVE_ID]);
        logger.success(`${accResult.rowCount} cuentas eliminadas`);

        logger.step('🗑️  Eliminando miembros...');
        const memResult = await client.query(`
            DELETE FROM members WHERE cooperative_id = $1
        `, [COOPERATIVE_ID]);
        logger.success(`${memResult.rowCount} miembros eliminados`);

        await client.query('COMMIT');
        logger.success('\n✅ Datos de migración eliminados correctamente');

        console.log(chalk.green('\n📝 Ahora puedes ejecutar la migración nuevamente:'));
        console.log(chalk.white('   node migrate.js'));

    } catch (error) {
        logger.error(`Error limpiando datos: ${error.message}`);
        console.error(error);

        if (client) {
            await client.query('ROLLBACK');
            logger.warning('Transacción revertida debido a error');
        }

        process.exit(1);

    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

// Run cleanup
cleanMigrationData().catch(error => {
    logger.error('Error fatal: ' + error.message);
    console.error(error);
    process.exit(1);
});
