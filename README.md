# mongoDB 
#### Command Helpers
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
- __`db.getCollection("users").find().pretty()`__
- __`db.getCollection("users").find().length()`__