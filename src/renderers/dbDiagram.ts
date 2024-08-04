export class dbDiagram {
    DatabaseType: DatabaseType;
    ConnectionString: string;
    Schema: string;
    Tables: string[];
    Detail: string;
}

export enum DatabaseType {
    MSSQL = 'mssql',
    PostgreSQL = 'postgresql'
}
