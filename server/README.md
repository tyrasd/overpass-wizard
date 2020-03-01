# overpass-wizard-server

Provides the overpass-wizard via HTTP using Node.js and [express](https://expressjs.com/).

## Deployment

1. `cd overpass-wizard/ && npm install`
2. `cd overpass-wizard/server/ && npm install`
3. `PORT=3000 node server.js`

## API

### `/wizard?search=`

Parameters:

- `search` – the search string
- All optional options, such as `comment`

Example:

```
$ curl --include 'localhost:3000/wizard?search=amenity=drinking_water&comment=false'
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 88
ETag: W/"58-8oFIvFicn/OL5KGo7KrFTB+boI4"
Date: Sat, 29 Feb 2020 22:17:51 GMT
Connection: keep-alive

[out:json][timeout:25][bbox:{{bbox}}];
(
  nwr["amenity"="drinking_water"];
);
out geom;
```

### `/wizard/version`

Returns the version of the overpass-wizard running on this server.

```
$ curl --include 'localhost:3000/wizard/version'
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 5
ETag: W/"5-dybzI3dlhHv5waY82EPp7XlKfgQ"
Date: Sun, 01 Mar 2020 20:26:44 GMT
Connection: keep-alive

0.0.9
```
