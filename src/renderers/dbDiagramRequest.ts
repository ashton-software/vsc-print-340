export class dbDiagramRequest {
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

export class dbDiagram{
    diagramTitle: string;
    schema: string;
    tables: table[];
}

export class table{
    tableName: string;
    columns: column[];
}

export class column{
    columnKey : Key;
    columnType: string;
    columnName: string;
}

export enum Key {
    PrimaryKey = 'pk',
    ForeignKey = 'fk'
}
