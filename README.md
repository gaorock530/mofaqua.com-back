# mongoDB 
###### full document see [MongoDB](https://docs.mongodb.com/manual/reference/mongo-shell/)
#### Command Helpers
- __`help`__	_Show help._
- __`db.help()`__ _Show help for database methods._
- __`db.<collection>.help()`__	_Show help on collection methods. The `<collection>` can be the name of an existing collection or a non-existing collection._
- __`show dbs`__	_Print a list of all databases on the server._
- __`use <db>`__	_Switch current database to `<db>`. The mongo shell variable db is set to the current database._
- __`show collections`__	_Print a list of all collections for current database._
- __`show users`__	_Print a list of users for current database._
- __`show roles`__	_Print a list of all roles, both user-defined and built-in, for the current database._
- __`show profile`__ _Print the five most recent operations that took 1 millisecond or more. See documentation on the database profiler for more information._
- __`show databases`__ _Print a list of all available databases._
#### Basic Shell JavaScript Operations
- __`db.auth()`__	_If running in secure mode, authenticate the user._
- __`coll = db.<collection>`__	_Set a specific collection in the current database to a variable coll, as in the following example: `coll = db.myCollection;` You can perform operations on the myCollection using the variable, as in the following example: `coll.find();`_
- __`db.collection.find()`__ _Find all documents in the collection and returns a cursor._
- __`db.collection.insertOne()`__ _Insert a new document into the collection._
- __`db.collection.insertMany()`__	_Insert multiple new documents into the collection._
- __`db.collection.updateOne()`__	_Update a single existing document in the collection._
- __`db.collection.updateMany()`__	_Update multiple existing documents in the collection._
- __`db.collection.save()`__	_Insert either a new document or update an existing document in the collection._
- __`db.collection.deleteOne()`__	_Delete a single document from the collection._
- __`db.collection.deleteMany()`__	_Delete documents from the collection._
- __`db.collection.drop()`__	_Drops or removes completely the collection._
- __`db.collection.createIndex()`__	_Create a new index on the collection if the index does not exist; otherwise, the operation has no effect._
- __`db.getSiblingDB()`__	_Return a reference to another database using this same connection without explicitly switching the current database. This allows for cross database queries._
- __`db.getCollection("users").find().pretty()`__
- __`db.getCollection("users").find().length()`__

# Nginx
- [proxy_read_timeout](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout)
  - __Syntax:__	_proxy_read_timeout time;_
  - __Default:__ `proxy_read_timeout 60s;`
  - __Context:__	http, server, location

# Node
- `export NODE_ENV=production`
- `$ sudo vim /etc/environment`
- Append the following at the end of the file: `NODE_ENV=production`
- Now logout and login again and now we can see the system wide environment variable: `$ printenv | grep NODE_ENV`

