# Installation steps

```
yarn install
```

And you have to re-create the database:

```
mysql -u root

CREATE USER 'foo'@'%' IDENTIFIED WITH mysql_native_password BY 'bar';
grant all privileges on *.* to 'foo'@'%';
FLUSH PRIVILEGES;

create database organic;

```

Run the migration once:
```
.\db-migrate.sh up
```

If the `db-migrate.sh` is not working, you must add the execute permission to it:

```
chmod +x .\db-migrate.sh
```
