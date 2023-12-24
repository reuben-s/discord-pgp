const fs = require('fs');
const path = require('path');

// In the future will optimise this with a cache to reduce the number of disk read/writes.

export class DbManager
{
    constructor(filePath) 
    {
        this._path = path.join(__dirname, filePath);
        this._initialiseDb();
    }

    _initialiseDb() 
    {
        // Create new database file if one does not exist.
        if (!fs.existsSync(this._path)) 
        {
            this._writeDb({});
            console.log("discord-pgp-> Create database file.");
        }
    }

    _fetchJson(callback) 
    {
        try 
        {
            fs.readFile(this._path, 'utf-8', (err, rawData) => {
                if (err)
                {
                    callback(err, rawData);
                }
                else
                {
                    callback(err, JSON.parse(rawData));
                }
            });
        } 
        catch (err) 
        {
            console.error('Error fetching JSON data:', err);
            throw err;
        }
    }

    _writeDb(db)
    {
        try
        {
            const serialized = JSON.stringify(db);
            fs.writeFile(this._path, serialized, (err) => {
                if (err) console.error(err);
            });
        }
        catch (err)
        {
            console.error('Error writing JSON data to database.', err);
        }
    }

    getChannel(channelId, callback)
    {
        if (channelId == undefined) return;

        this._fetchJson((err, db) => {
            if (err)
            {
                console.log(err);
                throw err;
            }

            if (!db.hasOwnProperty(channelId))
            {
                db[channelId] = {
                    "client": {
                        "public-key": null,
                        "private-key": null
                    },
                    "public-key": null
                }
                this._writeDb(db);
            }
            callback(db[channelId]);
        });
    }

    setClientKeyPair(channelId, publicKey, privateKey)
    {
        if (channelId == undefined || publicKey == undefined || privateKey == undefined) return;

        this._fetchJson((err, db) => {
            if (err)
            {
                console.log(err);
                throw err;
            }

            if (db.hasOwnProperty(channelId))
            {
                db[channelId]['client']['public-key'] = publicKey;
                db[channelId]['client']['private-key'] = privateKey;
                this._writeDb(db);
            }
        });
    }
}