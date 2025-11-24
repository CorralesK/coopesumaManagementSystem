/**
 * Logger Utilities with Colors
 * Provides formatted console output for migration process
 */

const chalk = require('chalk');

/**
 * Logs a success message
 * @param {string} message - Message to log
 */
function success(message) {
    console.log(chalk.green('✅ ' + message));
}

/**
 * Logs an error message
 * @param {string} message - Message to log
 */
function error(message) {
    console.log(chalk.red('❌ ' + message));
}

/**
 * Logs a warning message
 * @param {string} message - Message to log
 */
function warning(message) {
    console.log(chalk.yellow('⚠️  ' + message));
}

/**
 * Logs an info message
 * @param {string} message - Message to log
 */
function info(message) {
    console.log(chalk.blue('ℹ️  ' + message));
}

/**
 * Logs a step message (bold)
 * @param {string} message - Message to log
 */
function step(message) {
    console.log(chalk.bold.cyan('\n' + message));
}

/**
 * Logs a title/header
 * @param {string} title - Title to log
 */
function header(title) {
    console.log('\n' + chalk.bold.magenta('='.repeat(70)));
    console.log(chalk.bold.magenta(title));
    console.log(chalk.bold.magenta('='.repeat(70)));
}

/**
 * Prints migration summary report
 * @param {Object} stats - Migration statistics
 */
function printSummary(stats) {
    header('📊 RESUMEN DE MIGRACIÓN');

    console.log(chalk.bold.green('\n✅ DATOS INSERTADOS:'));
    console.log(chalk.white(`   Miembros:              ${chalk.bold(stats.members)} registros`));
    console.log(chalk.white(`   Cuentas creadas:       ${chalk.bold(stats.accounts)} cuentas`));
    console.log(chalk.white(`   Ahorros:               ${chalk.bold(stats.savings)} transacciones`));
    console.log(chalk.white(`   Aportaciones:          ${chalk.bold(stats.contributions)} transacciones`));
    console.log(chalk.white(`   Total transacciones:   ${chalk.bold(stats.savings + stats.contributions)}`));

    if (stats.skipped && stats.skipped.length > 0) {
        console.log(chalk.bold.yellow(`\n⚠️  REGISTROS OMITIDOS (${stats.skipped.length}):`));
        stats.skipped.slice(0, 10).forEach(s => {
            console.log(chalk.yellow(`   ${s.reason}: ${s.identification || s.value}`));
        });
        if (stats.skipped.length > 10) {
            console.log(chalk.yellow(`   ... y ${stats.skipped.length - 10} más`));
        }
    }

    if (stats.errors && stats.errors.length > 0) {
        console.log(chalk.bold.red(`\n❌ ERRORES (${stats.errors.length}):`));
        stats.errors.slice(0, 10).forEach(e => {
            console.log(chalk.red(`   ${e.error}: ${e.identification || e.value}`));
        });
        if (stats.errors.length > 10) {
            console.log(chalk.red(`   ... y ${stats.errors.length - 10} más`));
        }
    }

    console.log(chalk.bold.magenta('\n' + '='.repeat(70)));
}

/**
 * Prints a progress indicator
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {string} label - Label for the progress
 */
function progress(current, total, label) {
    const percentage = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    process.stdout.write(`\r${chalk.cyan(label)}: ${bar} ${percentage}% (${current}/${total})`);
    if (current === total) {
        console.log(); // New line when complete
    }
}

module.exports = {
    success,
    error,
    warning,
    info,
    step,
    header,
    printSummary,
    progress
};
