/**
 * Data Validation Utilities
 * Validates data before inserting into database
 */

const chalk = require('chalk');

/**
 * Validates members data
 * @param {Array} members - Array of member objects
 * @returns {Object} Validation result with errors and warnings
 */
function validateMembers(members) {
    const errors = [];
    const warnings = [];
    const seenIdentifications = new Set();

    members.forEach((member, index) => {
        const rowNumber = index + 5; // Excel row number (starts at 5)

        // 1. Identification must be unique
        if (seenIdentifications.has(member.identification)) {
            errors.push({
                row: rowNumber,
                field: 'identification',
                value: member.identification,
                error: 'Identificación duplicada'
            });
        }
        seenIdentifications.add(member.identification);

        // 2. Identification format validation
        if (!member.identification || !member.identification.match(/^\d-\d{4}-\d{4}$/)) {
            warnings.push({
                row: rowNumber,
                field: 'identification',
                value: member.identification,
                warning: 'Formato inusual de identificación (esperado: X-XXXX-XXXX)'
            });
        }

        // 3. Full name must not be empty
        if (!member.fullName || member.fullName.trim() === '') {
            errors.push({
                row: rowNumber,
                field: 'fullName',
                error: 'Nombre vacío'
            });
        }

        // 4. Valid affiliation date
        if (!member.affiliationDate || isNaN(new Date(member.affiliationDate).getTime())) {
            errors.push({
                row: rowNumber,
                field: 'affiliationDate',
                value: member.affiliationDate,
                error: 'Fecha de afiliación inválida'
            });
        }

        // 5. Grade must be valid (1-6)
        if (!member.grade || !member.grade.match(/^[1-6]$/)) {
            warnings.push({
                row: rowNumber,
                field: 'grade',
                value: member.grade,
                warning: 'Grado inválido o no especificado (esperado: 1-6)'
            });
        }
    });

    return { errors, warnings };
}

/**
 * Validates transactions data
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Validation result with errors
 */
function validateTransactions(transactions) {
    const errors = [];

    transactions.forEach((transaction, index) => {
        // 1. Amount must be positive
        if (!transaction.amount || transaction.amount <= 0) {
            errors.push({
                row: transaction._rowIndex || index,
                identification: transaction.identification,
                error: `Monto inválido o cero: ${transaction.amount}`
            });
        }

        // 2. Valid transaction date
        if (!transaction.transactionDate || isNaN(new Date(transaction.transactionDate).getTime())) {
            errors.push({
                row: transaction._rowIndex || index,
                identification: transaction.identification,
                error: 'Fecha de transacción inválida'
            });
        }

        // 3. Member identification exists
        if (!transaction.identification) {
            errors.push({
                row: transaction._rowIndex || index,
                error: 'Identificación de miembro vacía'
            });
        }
    });

    return { errors };
}

/**
 * Prints validation report
 * @param {Object} memberValidation - Member validation results
 * @param {Object} savingsValidation - Savings validation results
 * @param {Object} contributionsValidation - Contributions validation results
 */
function printValidationReport(memberValidation, savingsValidation, contributionsValidation) {
    console.log('\n' + chalk.bold.blue('='.repeat(70)));
    console.log(chalk.bold.blue('📋 REPORTE DE VALIDACIÓN'));
    console.log(chalk.bold.blue('='.repeat(70)));

    // Member errors
    if (memberValidation.errors.length > 0) {
        console.log(chalk.bold.red(`\n❌ ERRORES EN MIEMBROS (${memberValidation.errors.length}):`));
        memberValidation.errors.slice(0, 10).forEach(e => {
            console.log(chalk.red(`   Fila ${e.row}: ${e.error} - ${e.field}: "${e.value}"`));
        });
        if (memberValidation.errors.length > 10) {
            console.log(chalk.red(`   ... y ${memberValidation.errors.length - 10} errores más`));
        }
    } else {
        console.log(chalk.green('\n✅ Miembros: Sin errores'));
    }

    // Member warnings
    if (memberValidation.warnings.length > 0) {
        console.log(chalk.bold.yellow(`\n⚠️  ADVERTENCIAS EN MIEMBROS (${memberValidation.warnings.length}):`));
        memberValidation.warnings.slice(0, 10).forEach(w => {
            console.log(chalk.yellow(`   Fila ${w.row}: ${w.warning} - ${w.field}: "${w.value}"`));
        });
        if (memberValidation.warnings.length > 10) {
            console.log(chalk.yellow(`   ... y ${memberValidation.warnings.length - 10} advertencias más`));
        }
    }

    // Savings errors
    if (savingsValidation.errors.length > 0) {
        console.log(chalk.bold.red(`\n❌ ERRORES EN AHORROS (${savingsValidation.errors.length}):`));
        savingsValidation.errors.slice(0, 10).forEach(e => {
            console.log(chalk.red(`   Fila ${e.row}: ${e.error} - ID: ${e.identification}`));
        });
        if (savingsValidation.errors.length > 10) {
            console.log(chalk.red(`   ... y ${savingsValidation.errors.length - 10} errores más`));
        }
    } else {
        console.log(chalk.green('\n✅ Ahorros: Sin errores'));
    }

    // Contributions errors
    if (contributionsValidation.errors.length > 0) {
        console.log(chalk.bold.red(`\n❌ ERRORES EN APORTACIONES (${contributionsValidation.errors.length}):`));
        contributionsValidation.errors.slice(0, 10).forEach(e => {
            console.log(chalk.red(`   Fila ${e.row}: ${e.error} - ID: ${e.identification}`));
        });
        if (contributionsValidation.errors.length > 10) {
            console.log(chalk.red(`   ... y ${contributionsValidation.errors.length - 10} errores más`));
        }
    } else {
        console.log(chalk.green('\n✅ Aportaciones: Sin errores'));
    }

    console.log(chalk.bold.blue('\n' + '='.repeat(70)));

    const totalErrors = memberValidation.errors.length +
                       savingsValidation.errors.length +
                       contributionsValidation.errors.length;

    return totalErrors === 0;
}

/**
 * Checks if there are validation errors
 * @param {Object} memberValidation - Member validation results
 * @param {Object} savingsValidation - Savings validation results
 * @param {Object} contributionsValidation - Contributions validation results
 * @returns {boolean} True if there are errors
 */
function hasErrors(memberValidation, savingsValidation, contributionsValidation) {
    return memberValidation.errors.length > 0 ||
           savingsValidation.errors.length > 0 ||
           contributionsValidation.errors.length > 0;
}

module.exports = {
    validateMembers,
    validateTransactions,
    printValidationReport,
    hasErrors
};
