const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
});

async function verify() {
    const client = await pool.connect();
    try {
        // Verificar miembro 161-2022
        const member = await client.query(`
            SELECT m.member_id, m.full_name, m.member_code, a.current_balance
            FROM members m
            JOIN accounts a ON m.member_id = a.member_id
            WHERE m.member_code = '161-2022' AND a.account_type = 'savings'
        `);

        console.log('=== Miembro 161-2022 ===');
        console.log('Nombre:', member.rows[0]?.full_name);
        console.log('Saldo en DB: ₡' + parseFloat(member.rows[0]?.current_balance).toLocaleString());
        console.log('Saldo esperado: ₡316,615');
        console.log('¿Coincide?', parseFloat(member.rows[0]?.current_balance) === 316615 ? '✅ SÍ' : '❌ NO');

        // Ver transacciones
        const transactions = await client.query(`
            SELECT t.transaction_date, t.receipt_number, t.amount, t.description
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            JOIN members m ON a.member_id = m.member_id
            WHERE m.member_code = '161-2022' AND a.account_type = 'savings'
            ORDER BY t.transaction_date
        `);

        console.log('\nTransacciones:');
        let total = 0;
        transactions.rows.forEach(t => {
            console.log('  ' + t.transaction_date.toISOString().split('T')[0] + ' | ' +
                       (t.receipt_number || 'N/A').toString().padEnd(6) + ' | ₡' +
                       parseFloat(t.amount).toLocaleString().padStart(10));
            total += parseFloat(t.amount);
        });
        console.log('\n  Suma de transacciones: ₡' + total.toLocaleString());

        // También verificar 156-2022
        const member156 = await client.query(`
            SELECT m.full_name, a.current_balance
            FROM members m
            JOIN accounts a ON m.member_id = a.member_id
            WHERE m.member_code = '156-2022' AND a.account_type = 'savings'
        `);

        console.log('\n=== Miembro 156-2022 ===');
        console.log('Nombre:', member156.rows[0]?.full_name);
        console.log('Saldo: ₡' + parseFloat(member156.rows[0]?.current_balance).toLocaleString());
        console.log('Esperado: ₡4,350', parseFloat(member156.rows[0]?.current_balance) === 4350 ? '✅' : '❌');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

verify();