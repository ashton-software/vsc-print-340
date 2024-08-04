import {DatabaseType, dbDiagram, dbDiagramRequest} from "./dbDiagramRequest";

export class dbRenderer {
    // https://mermaid.js.org/syntax/entityRelationshipDiagram.html
    renderDbDiagram(dbDiagram: dbDiagramRequest): dbDiagram {
        // TODO: NOT IMPLEMENTED
        return new dbDiagram();
    }

    parseDbDiagram(text: string): dbDiagramRequest {
        let db = new dbDiagramRequest();
        let lines = text.split('\n');
        lines.forEach(line => {
            if (line.includes("DatabaseType")) {
                db.DatabaseType = DatabaseType[line.split(":")[1].trim() as keyof typeof DatabaseType];
            } else if (line.includes("ConnectionString")) {
                db.ConnectionString = line.split(":")[1].trim();
            } else if (line.includes("Schema")) {
                db.Schema = line.split(":")[1].trim();
            } else if (line.includes("Tables")) {
                db.Tables = line.split(":")[1].trim().split(",");
            } else if (line.includes("Detail")) {
                db.Detail = line.split(":")[1].trim();
            }
        })

        return db;
    }


}
