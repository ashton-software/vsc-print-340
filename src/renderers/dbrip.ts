// npm install oracledb mssql mysql2 pg


import oracledb from 'oracledb';
import { Connection as MSSQLConnection, Request as MSSQLRequest } from 'mssql';
import mysql from 'mysql2/promise';
import { Client as PGClient } from 'pg';

interface Column {
  name: string;
  type: string;
}

interface Table {
  name: string;
  columns: Column[];
}

async function getOracleTables(connection: oracledb.Connection): Promise<Table[]> {
  const tables: Table[] = [];
  const result = await connection.execute(`SELECT table_name FROM user_tables`);
  const tableNames = result.rows?.map(row => row[0]);

  for (const tableName of tableNames || []) {
    const columnsResult = await connection.execute(
      `SELECT column_name, data_type FROM user_tab_columns WHERE table_name = :tableName`,
      [tableName]
    );
    const columns = columnsResult.rows?.map(row => ({ name: row[0], type: row[1] })) || [];
    tables.push({ name: tableName, columns });
  }

  return tables;
}

async function getMSSQLTables(connection: MSSQLConnection): Promise<Table[]> {
  const tables: Table[] = [];
  const request = new MSSQLRequest(connection);
  const result = await request.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`);
  const tableNames = result.recordset.map(row => row.TABLE_NAME);

  for (const tableName of tableNames) {
    const columnsResult = await request.query(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`
    );
    const columns = columnsResult.recordset.map(row => ({ name: row.COLUMN_NAME, type: row.DATA_TYPE }));
    tables.push({ name: tableName, columns });
  }

  return tables;
}

async function getMySQLTables(connection: mysql.Connection): Promise<Table[]> {
  const tables: Table[] = [];
  const [tablesResult] = await connection.query("SHOW TABLES");
  const tableNames = tablesResult.map((row: any) => Object.values(row)[0]);

  for (const tableName of tableNames) {
    const [columnsResult] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
    const columns = columnsResult.map((row: any) => ({ name: row.Field, type: row.Type }));
    tables.push({ name: tableName, columns });
  }

  return tables;
}

async function getPostgreSQLTables(client: PGClient): Promise<Table[]> {
  const tables: Table[] = [];
  const result = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  const tableNames = result.rows.map(row => row.table_name);

  for (const tableName of tableNames) {
    const columnsResult = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`,
      [tableName]
    );
    const columns = columnsResult.rows.map(row => ({ name: row.column_name, type: row.data_type }));
    tables.push({ name: tableName, columns });
  }

  return tables;
}

function generateMermaidERDiagram(tables: Table[]): string {
  let mermaidDiagram = 'erDiagram\n';

  for (const table of tables) {
    mermaidDiagram += `  ${table.name} {\n`;
    for (const column of table.columns) {
      mermaidDiagram += `    ${column.name} ${column.type}\n`;
    }
    mermaidDiagram += '  }\n';
  }

  return mermaidDiagram;
}

async function main() {
  // Example for Oracle
  const oracleConnection = await oracledb.getConnection({
    user: 'your_username',
    password: 'your_password',
    connectString: 'localhost/your_service_name'
  });
  const oracleTables = await getOracleTables(oracleConnection);
  console.log(generateMermaidERDiagram(oracleTables));
  await oracleConnection.close();

  // Example for MSSQL
  const mssqlConnection = await MSSQLConnection.connect({
    user: 'your_username',
    password: 'your_password',
    server: 'localhost',
    database: 'your_database'
  });
  const mssqlTables = await getMSSQLTables(mssqlConnection);
  console.log(generateMermaidERDiagram(mssqlTables));
  await mssqlConnection.close();

  // Example for MySQL
  const mysqlConnection = await mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
  });
  const mysqlTables = await getMySQLTables(mysqlConnection);
  console.log(generateMermaidERDiagram(mysqlTables));
  await mysqlConnection.end();

  // Example for PostgreSQL
  const pgClient = new PGClient({
    user: 'your_username',
    password: 'your_password',
    host: 'localhost',
    database: 'your_database'
  });
  await pgClient.connect();
  const pgTables = await getPostgreSQLTables(pgClient);
  console.log(generateMermaidERDiagram(pgTables));
  await pgClient.end();
}

main().catch(console.error);
