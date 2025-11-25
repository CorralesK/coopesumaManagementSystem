/**
 * Main Migration Script (Completo - Fases 1 y 2)
 * Migrates historical data from Excel files to PostgreSQL database
 * Includes: Members, Accounts, Savings, Contributions, and Surplus (Excedentes)
 */

require('dotenv').config();
const chalk = require('chalk');
const { getClient, pool } = require('./config/database');
const logger = require('./utils/logger');
const { validateMembers, validateTransactions, printValidationReport, hasErrors } = require('./utils/validator');

// Readers
const { readMembersFromExcel } = require('./readers/members.reader');
const { readSavingsFromExcel } = require('./readers/savings.reader');
const { readContributionsFromExcel } = require('./readers/contributions.reader');
const { readSurplusFromExcel } = require('./readers/surplus.reader');

// Services
const {
    ensureBasicData,
    disableMigrationBlockingTriggers,
    enableMigrationBlockingTriggers
} = require('./services/seed.service');
const { insertMembers, createIdentificationMap } = require('./services/member.service');
const { createAccounts } = require('./services/account.service');
const {
    insertSavingsTransactions,
    insertContributionTransactions,
    updateAccountBalances
} = require('./services/transaction.service');
const {
    insertSurplusDistributions,
    insertSurplusWithdrawals,
    insertContributionWithdrawals
} = require('./services/surplus.service');

// Configuration
const DRY_RUN = process.env.DRY_RUN === 'true';
const SKIP_VALIDATION = process.env.SKIP_VALIDATION === 'true';
const COOPERATIVE_ID = parseInt(process.env.COOPERATIVE_ID) || 1;
const ADMIN_USER_ID = parseInt(process.env.ADMIN_USER_ID) || 1;

const EXCEL_FILES = {
    members: process.env.EXCEL_MEMBERS || './data/Lista_asociados__madre_y_depurada__2025.xlsx',
    savings: process.env.EXCEL_SAVINGS || './data/CONTROL_AHORROS__FORMULAS_Coopesuma_2025.xlsx',
    contributions: process.env.EXCEL_CONTRIBUTIONS || './data/Registro_de_Aportaciones_2022_al_2025_CORREGIDO_LISTO_IMPRIMIR.xlsm'
};

/**
 * Main migration function
 */
async function runMigration() {
    logger.header('🚀 INICIANDO MIGRACIÓN COMPLETA DE DATOS - COOPESUMA');
    logger.info('Incluye: Miembros, Cuentas, Ahorros, Aportaciones y Excedentes');

    if (DRY_RUN) {
        logger.warning('MODO DRY RUN ACTIVADO - No se guardará nada en la base de datos');
    }

    console.log(chalk.cyan('\nConfiguración:'));
    console.log(`  Cooperative ID: ${COOPERATIVE_ID}`);
    console.log(`  Admin User ID: ${ADMIN_USER_ID}`);
    console.log(`  DRY RUN: ${DRY_RUN}`);
    console.log(`  Skip Validation: ${SKIP_VALIDATION}`);

    const stats = {
        members: 0,
        accounts: 0,
        savings: 0,
        contributions: 0,
        distributions: 0,
        surplusWithdrawals: 0,
        contributionWithdrawals: 0,
        errors: [],
        skipped: []
    };

    let client;

    try {
        // ===================================================================
        // PHASE 1: READ EXCEL FILES
        // ===================================================================
        logger.header('📖 FASE 1: LECTURA DE ARCHIVOS EXCEL');

        const members = readMembersFromExcel(EXCEL_FILES.members);
        const savingsTransactions = readSavingsFromExcel(EXCEL_FILES.savings);
        const contributionData = readContributionsFromExcel(EXCEL_FILES.contributions);
        const surplusData = readSurplusFromExcel(EXCEL_FILES.contributions); // Same file as contributions

        console.log(chalk.green(`\n✅ Archivos leídos correctamente:`));
        console.log(`   Miembros: ${members.length}`);
        console.log(`   Transacciones de ahorro: ${savingsTransactions.length}`);
        console.log(`   Saldos iniciales de aportaciones: ${contributionData.initialBalances.length}`);
        console.log(`   Transacciones de aportaciones: ${contributionData.transactions.length}`);
        console.log(`   Distribuciones de excedentes: ${surplusData.distributions.length}`);
        console.log(`   Retiros de excedentes: ${surplusData.surplusWithdrawals.length}`);
        console.log(`   Retiros de aportaciones (excedentes): ${surplusData.contributionWithdrawals.length}`);

        // ===================================================================
        // PHASE 2: VALIDATION
        // ===================================================================
        logger.header('✅ FASE 2: VALIDACIÓN DE DATOS');

        const memberValidation = validateMembers(members);
        const savingsValidation = validateTransactions(savingsTransactions);
        const contributionsValidation = validateTransactions(contributionData.transactions);

        const validationPassed = printValidationReport(
            memberValidation,
            savingsValidation,
            contributionsValidation
        );

        if (!validationPassed && !SKIP_VALIDATION) {
            throw new Error('Errores de validación encontrados. Corrígelos antes de continuar o usa SKIP_VALIDATION=true');
        }

        if (!validationPassed && SKIP_VALIDATION) {
            logger.warning('Validación falló pero SKIP_VALIDATION está activado, continuando...');
        }

        // ===================================================================
        // PHASE 3: DATABASE MIGRATION
        // ===================================================================
        logger.header('💾 FASE 3: MIGRACIÓN A BASE DE DATOS');

        client = await getClient();

        // Start transaction
        await client.query('BEGIN');
        logger.info('Transacción SQL iniciada');

        // 3.0: Ensure basic data exists (school, cooperative, catalogs)
        await ensureBasicData(client, COOPERATIVE_ID);

        // 3.1: Insert members
        console.log(chalk.yellow(`DEBUG: Insertando ${members.length} miembros...`));
        const insertedMembers = await insertMembers(client, members, COOPERATIVE_ID);
        stats.members = insertedMembers.length;
        console.log(chalk.yellow(`DEBUG: ${insertedMembers.length} miembros insertados`));

        // Verify members were inserted
        const checkInserted = await client.query('SELECT COUNT(*) FROM members');
        console.log(chalk.yellow(`DEBUG: Miembros en DB después del insert: ${checkInserted.rows[0].count}`));

        // 3.2: Create ALL accounts for each member (savings, contributions, AND surplus)
        const accountsCreated = await createAccounts(client, insertedMembers, COOPERATIVE_ID, true);
        stats.accounts = accountsCreated;

        // 3.3: Create identification map for transaction lookup
        const identificationMap = createIdentificationMap(insertedMembers);
        logger.info(`Mapa de identificaciones creado con ${identificationMap.size} entradas`);

        // 3.4: Disable triggers to allow historical data insertion
        await disableMigrationBlockingTriggers(client);

        // 3.5: Insert savings transactions
        const savingsResult = await insertSavingsTransactions(
            client,
            savingsTransactions,
            identificationMap,
            ADMIN_USER_ID
        );
        stats.savings = savingsResult.inserted;
        stats.savingsSkipped = savingsResult.skipped;

        // 3.6: Insert initial balances for contributions (saldos acumulados)
        const initialBalancesResult = await insertContributionTransactions(
            client,
            contributionData.initialBalances,
            identificationMap,
            ADMIN_USER_ID
        );
        stats.contributionInitialBalances = initialBalancesResult.inserted;
        stats.contributionInitialBalancesSkipped = initialBalancesResult.skipped;

        // 3.7: Insert contribution transactions
        const contributionsResult = await insertContributionTransactions(
            client,
            contributionData.transactions,
            identificationMap,
            ADMIN_USER_ID
        );
        stats.contributions = contributionsResult.inserted;
        stats.contributionsSkipped = contributionsResult.skipped;

        // 3.8: Insert surplus distributions
        const distributionsResult = await insertSurplusDistributions(
            client,
            surplusData.distributions,
            identificationMap,
            ADMIN_USER_ID
        );
        stats.distributions = distributionsResult.inserted;
        stats.distributionsSkipped = distributionsResult.skipped;

        // 3.9: Insert surplus withdrawals
        const surplusWithdrawalsResult = await insertSurplusWithdrawals(
            client,
            surplusData.surplusWithdrawals,
            identificationMap,
            ADMIN_USER_ID
        );
        stats.surplusWithdrawals = surplusWithdrawalsResult.inserted;
        stats.surplusWithdrawalsSkipped = surplusWithdrawalsResult.skipped;

        // 3.10: Insert contribution withdrawals (from surplus)
        // NOTE: Skipping contribution withdrawals as they are from members who are no longer active
        // and would require manual reconciliation. These can be added later if needed.
        logger.step('💰 Omitiendo retiros de aportaciones (miembros inactivos/retirados)...');
        stats.contributionWithdrawals = 0;
        stats.contributionWithdrawalsSkipped = surplusData.contributionWithdrawals;
        logger.warning(`${surplusData.contributionWithdrawals.length} retiros de aportaciones omitidos (requieren reconciliación manual)`);

        // 3.11: Re-enable triggers after migration completes
        await enableMigrationBlockingTriggers(client);

        // ===================================================================
        // PHASE 4: COMMIT OR ROLLBACK
        // ===================================================================
        logger.header('🔒 FASE 4: FINALIZACIÓN');

        if (DRY_RUN) {
            await client.query('ROLLBACK');
            logger.warning('DRY RUN: Transacción revertida - Nada fue guardado');
        } else {
            console.log(chalk.yellow('DEBUG: Ejecutando COMMIT...'));
            await client.query('COMMIT');
            console.log(chalk.yellow('DEBUG: COMMIT completado'));
            logger.success('¡Transacción confirmada exitosamente!');

            // Verify immediately after commit
            const checkMembers = await client.query('SELECT COUNT(*) FROM members');
            console.log(chalk.yellow(`DEBUG: Miembros después de COMMIT: ${checkMembers.rows[0].count}`));
        }

        // ===================================================================
        // PHASE 5: VERIFICATION AND SUMMARY
        // ===================================================================
        logger.header('📊 FASE 5: VERIFICACIÓN Y RESUMEN');

        // Get account balances
        if (!DRY_RUN) {
            const balances = await updateAccountBalances(client);
            console.log(chalk.bold.cyan('\nSaldos por tipo de cuenta:'));
            balances.forEach(b => {
                console.log(chalk.cyan(`   ${b.account_type}: ${b.account_count} cuentas, ₡${parseFloat(b.total_balance).toFixed(2)} total`));
            });
        }

        // Print final summary
        console.log(chalk.bold.cyan('\n✅ DATOS INSERTADOS:'));
        console.log(chalk.cyan(`   Miembros:                      ${stats.members} registros`));
        console.log(chalk.cyan(`   Cuentas creadas:               ${stats.accounts} cuentas`));
        console.log(chalk.cyan(`   Ahorros:                       ${stats.savings} transacciones`));
        console.log(chalk.cyan(`   Saldos iniciales aportaciones: ${stats.contributionInitialBalances || 0} transacciones`));
        console.log(chalk.cyan(`   Aportaciones:                  ${stats.contributions} transacciones`));
        console.log(chalk.cyan(`   Distribuciones de excedentes:  ${stats.distributions} transacciones`));
        console.log(chalk.cyan(`   Retiros de excedentes:         ${stats.surplusWithdrawals} transacciones`));
        console.log(chalk.cyan(`   Retiros de aportaciones:       ${stats.contributionWithdrawals} transacciones`));
        const totalTxs = stats.savings + (stats.contributionInitialBalances || 0) + stats.contributions + stats.distributions + stats.surplusWithdrawals + stats.contributionWithdrawals;
        console.log(chalk.cyan(`   Total transacciones:           ${totalTxs}`));

        // Print detailed report of skipped transactions
        const hasSkipped = (stats.savingsSkipped?.length > 0) ||
                          (stats.contributionsSkipped?.length > 0) ||
                          (stats.distributionsSkipped?.length > 0) ||
                          (stats.surplusWithdrawalsSkipped?.length > 0) ||
                          (stats.contributionWithdrawalsSkipped?.length > 0);

        if (!DRY_RUN && hasSkipped) {
            console.log(chalk.bold.yellow('\n⚠️  REPORTE DE TRANSACCIONES OMITIDAS:'));

            // Combine all skipped transactions
            const allSkipped = [
                ...(stats.savingsSkipped || []).map(s => ({ ...s, type: 'Ahorro' })),
                ...(stats.contributionsSkipped || []).map(s => ({ ...s, type: 'Aportación' })),
                ...(stats.distributionsSkipped || []).map(s => ({ ...s, type: 'Distribución Excedentes' })),
                ...(stats.surplusWithdrawalsSkipped || []).map(s => ({ ...s, type: 'Retiro Excedentes' })),
                ...(stats.contributionWithdrawalsSkipped || []).map(s => ({ ...s, type: 'Retiro Aportaciones' }))
            ];

            // Group by member code
            const groupedByCode = {};
            allSkipped.forEach(s => {
                const code = s.memberCode || s.identification;
                if (!groupedByCode[code]) {
                    groupedByCode[code] = [];
                }
                groupedByCode[code].push(s);
            });

            console.log(chalk.yellow(`\nTotal de códigos no encontrados: ${Object.keys(groupedByCode).length}`));
            console.log(chalk.yellow(`Total de transacciones omitidas: ${allSkipped.length}\n`));

            // Print first 20 codes with their transaction counts
            Object.entries(groupedByCode).slice(0, 20).forEach(([code, txs]) => {
                const savingsCount = txs.filter(t => t.type === 'Ahorro').length;
                const contributionsCount = txs.filter(t => t.type === 'Aportación').length;
                const distributionsCount = txs.filter(t => t.type === 'Distribución Excedentes').length;
                const surplusWithdrawalsCount = txs.filter(t => t.type === 'Retiro Excedentes').length;
                const contribWithdrawalsCount = txs.filter(t => t.type === 'Retiro Aportaciones').length;
                const totalAmount = txs.reduce((sum, t) => sum + (t.amount || 0), 0);

                console.log(chalk.yellow(`   ${code}: ${txs.length} txs (${savingsCount} aho, ${contributionsCount} apo, ${distributionsCount} dis, ${surplusWithdrawalsCount} ret-exc, ${contribWithdrawalsCount} ret-apo) - ₡${totalAmount.toFixed(2)}`));
            });

            if (Object.keys(groupedByCode).length > 20) {
                console.log(chalk.yellow(`   ... y ${Object.keys(groupedByCode).length - 20} códigos más`));
            }

            console.log(chalk.yellow('\n💡 Posibles causas:'));
            console.log(chalk.white('   1. Miembros que se retiraron antes de ser incluidos en la lista actual'));
            console.log(chalk.white('   2. Códigos con formato diferente en Excel de miembros vs transacciones'));
            console.log(chalk.white('   3. Errores de digitación en los códigos de miembro'));
        }

        logger.success('\n✅ ¡MIGRACIÓN COMPLETA EXITOSA!');

        if (DRY_RUN) {
            console.log(chalk.yellow('\n⚠️  Recuerda: Esto fue un DRY RUN. Para guardar los datos, ejecuta:'));
            console.log(chalk.yellow('   npm run migrate'));
        } else {
            console.log(chalk.green('\n📝 Próximos pasos:'));
            console.log(chalk.white('   1. Verificar los datos en la base de datos'));
            console.log(chalk.white('   2. Asignar grados correctos a los miembros'));
            console.log(chalk.white('   3. Asignar correos institucionales'));
            console.log(chalk.white('   4. Verificar saldos contra archivos Excel originales'));
            console.log(chalk.white('   5. Revisar transacciones omitidas si las hay'));
        }

    } catch (error) {
        logger.error(`\nError durante la migración: ${error.message}`);
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

// ===================================================================
// EXECUTION
// ===================================================================

// Check required environment variables
const requiredEnvVars = ['DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
    logger.error(`Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
    logger.info('Crea un archivo .env basado en .env.example');
    process.exit(1);
}

// Run migration
runMigration().catch(error => {
    logger.error('Error fatal: ' + error.message);
    console.error(error);
    process.exit(1);
});
