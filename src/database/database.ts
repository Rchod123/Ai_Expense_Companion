import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DATABASE_NAME = 'expense_companion.db';

let dbInstance : SQLite.SQLiteDatabase | null = null;

export const getDatabase = async () =>{
    if(dbInstance){
        return dbInstance
    }

    dbInstance = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default'
    });

    return dbInstance;
};


export const execute = async (
    sql: string,
    params: any[] = []
) => {
    const db = await getDatabase();
    return db.executeSql(sql,params);
}
