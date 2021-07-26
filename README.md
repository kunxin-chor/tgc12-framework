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
./db-migrate.sh up
```

If the `db-migrate.sh` is not working, you must add the execute permission to it:

```
chmod +x ./db-migrate.sh
```
# Pushing to your own Github repoistory
If you wish to push changes to your own Github repoistory, follow
the following steps.

1. Create a new repoistory on Github (there is no need to use a template). Leave all settings as it is.

2. Add in the following commands:

```
git remote set-url origin <url of your github repoistory>.git
```
Followed by:

```
git push origin HEAD
```

# Blank .env file
You need to provide values for the settings below in your .env file:

```
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=
DB_DRIVER=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_HOST=
SESSION_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_SUCCESS_URL=
STRIPE_ERROR_URL=
STRIPE_ENDPOINT_SECRET=
TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```