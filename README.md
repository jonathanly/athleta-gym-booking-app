# MongoDB + Express + React + Node + 💖

## Set up

### API

Create `api/.env` file:
```
MONGO_URL=mongodb://localhost/test
SESSION_SECRET=__REMEMBER_TO_CHANGE_THIS__
```

### React Front-end

Create `react/.env` file:
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SOMETHING_ELSE=1
```

## Run

### Local MongoDB

```
mkdir -p ~/db/mongodb
mongod --dbpath ~/db/mongodb/
```

If `mongodb.lock` error, shut down existing `mongod` processes:
```
ps aux | grep mongo
kill -9 PID
```

### API

```
cd api
npm install
PORT=3001 nodemon
```

### React

```
cd react
npm install
npm start
```

## Deploying

### API

```
cd api
now -e MONGO_URL=mongodb://USERNAME:PASSWORD@ACCOUNT.mlab.com:41078/staging -e NODE_ENV=production
```

Copy the URL to be used below.

### React

```
cd react
REACT_APP_API_URL=__YOUR_NOW_API_URL__ npm run build
cd build
now
```