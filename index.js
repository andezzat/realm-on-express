const Realm = require('realm');
const express = require('express');
const bodyParser = require('body-parser');
const rlib = require('./lib/realm');

const app = express();

// A dummy schema to kick the realm off
const defaultRealmSchema = [
  {
    name: 'Person',
    primaryKey: 'id',
    properties: {
      id: 'int',
      name: 'string',
      age: { type: 'double', optional: true },
      dogs: { type: 'list', objectType: 'Dog' }
    }
  },
  {
    name: 'Dog',
    primaryKey: 'id',
    properties: {
      id: 'int',
      name: 'string',
      breed: 'string',
      age: { type: 'double', optional: true }
    },
  },
];

// The default schema used to store information about other realms (default only... for now)
const metaRealmSchema = [{
  name: 'meta',
  primaryKey: 'schemaVersion',
  properties: {
    schemaVersion: 'int',
    schema: 'string',
    path: 'string',
  }
}];

// Starting the meta realm
let metaRealm = rlib.createRealm(metaRealmSchema, 0, 'meta.realm');

// Populates the meta realm for the first time
if (metaRealm.objects('meta').length < 1) {
  rlib.writeToRealm(metaRealm, [{
    action: 'add',
    schema: 'meta',
    object: {
      schemaVersion: 0,
      schema: JSON.stringify(defaultRealmSchema),
      path: 'default.realm',
    }
  }]);
}

let metaData = metaRealm.objects('meta').filtered('path = "default.realm"').sorted('schemaVersion', true); // grabbing all metaData for our default realm (realm.default) sorted by latest (descending) schemaVersion
let realm = rlib.createRealm(JSON.parse(metaData["0"].schema), metaData["0"].schemaVersion); // Create default realm from latest (["0"]) metaData

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', 'http://localhost:3000');
  res.setHeader('access-control-allow-credentials', true);
  next();
});

app.get('/', (req, res) => {
  res.send({
    path: metaData["0"].path,
    schemaVersion: metaData["0"].schemaVersion,
    schema: JSON.parse(metaData["0"].schema),
  });
});

app.get('/path', (req, res) => {
  res.send({
    path: metaData["0"].path,
  })
});

app.get('/schema', (req, res) => {
  res.send({
    schema: metaData["0"].schema,
  })
});

app.get('/schema/version', (req, res) => {
  res.send({
    schemaVersion: metaData["0"].schemaVersion,
  });
});

app.get('/get/:schema', (req, res) => {
  res.send({
    results: realm.objects(req.params.schema).filtered(req.query.filter)
  });
});

app.get('/get/:schema/all', (req, res) => {
  res.send({
    results: realm.objects(req.params.schema)
  });
});

app.get('/get/:schema/:id', (req, res) => {
  res.send({
    results: { "0": realm.objectForPrimaryKey(req.params.schema, Number(req.params.id)) }
  });
});

app.get('/get/:schema/length', (req, res) => {
  res.send({
    length: realm.objects(req.params.schema).length,
  });
});

app.post('/write', (req, res, next) => {
  console.info('Processing multiple writes...');
  next();
}, (req, res, next) => {
  rlib.writeToRealm(realm, req.body);
  console.info('Processed the following writes successfully:', req.body);
  res.send({
    action: 'multipleWrites',
    success: true,
  })
});

app.post('/add/:schema', (req, res, next) => {
  console.info('Adding the following to ', req.params.schema, ' schema:\n', req.body);
  next()
}, (req, res, next) => {
  rlib.writeToRealm(realm, [{ schema: req.params.schema, object: req.body }]);
  console.info(req.params.schema, ' has been added successfully!\n');
  res.send({
    schema: req.params.schema,
    action: "add",
    success: true,
  });
});

app.post('/add/:schema/nest', (req, res, next) => {
  // console.info('Adding the following to ', req.params.schema, ' schema and nesting into property named ', req.query.property, ':\n', req.body);
  next()
}, (req, res, next) => {
  console.log(realm.objects(req.params.schema).filtered(req.query.filter)["0"][req.query.property]);
  rlib.writeToRealm(realm, [{ schema: req.params.schema, object: req.body, action: 'nest', filter: req.query.filter, property: req.query.property }]);
  console.info('Object added to ', req.params.schema, 'under property ', req.query.property, ' successfully!\n');
  res.send({
    schema: req.params.schema,
    action: "nest",
    success: true,
  });
});

app.post('/update/:schema', (req, res, next) => {
  console.info('Updating the following to ', req.params.schema, ' schema:\n', req.body);
  next()
}, (req, res, next) => {
  rlib.writeToRealm(realm, [{ schema: req.params.schema, object: req.body, action: 'update' }]);
  console.info(req.params.schema, ' has been updated successfully!\n');
  res.send({
    schema: req.params.schema,
    action: "update",
    success: true,
  });
});

app.post('/delete/:schema', (req, res, next) => {
  console.info('Deleting the following ', req.params.schema, ' :\n', req.query.filter);
  next()
}, (req, res, next) => {
  rlib.writeToRealm(realm, [{ schema: req.params.schema, action: 'delete', filter: req.query.filter }]);
  console.info(req.params.schema, ' has been deleted successfully!\n');
  res.send({
    schema: req.params.schema,
    action: "delete",
    success: true,
  });
});

app.post('/delete/:schema/all', (req, res, next) => {
  console.info('Deleting all ', req.params.schema);
  next()
}, (req, res, next) => {
  rlib.writeToRealm(realm, [{ schema: req.params.schema, action: 'deleteAll' }]);
  console.info('All objects of schema type ', req.params.schema, ' have been deleted successfully!\n');
  res.send({
    schema: req.params.schema,
    action: "deleteAll",
    success: true,
  });
});

app.post('/schema/update', (req, res, next) => {
  console.info('Updating the schema...');
  next()
}, (req, res, next) => {
  realm.close();
  realm = rlib.createRealm(req.body, metaData["0"].schemaVersion + 1);

  if (rlib.fetchSchemaVersion() === metaData["0"].schemaVersion + 1) {
    console.log('Updating metaData...');
    const newMetaRealmData = {
      schemaVersion: metaData["0"].schemaVersion + 1,
      schema: JSON.stringify(req.body),
      path: 'default.realm',
    }
    rlib.writeToRealm(metaRealm, [{ schema: 'meta', object: newMetaRealmData, action: 'add' }]); // Updates the meta data of the realm
  }
  next();
}, (req, res, next) => {
  res.send({
    action: "updateSchema",
    schemaVersion: metaData["0"].schemaVersion,
    success: true,
  });
  console.info('Schema successfully updated to: ', req.body);
  console.log('\n\nschemaVersion from metaRealm is: ', metaData["0"].schemaVersion);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).send({
    success: false,
    error: err.message,
  });
});

app.listen(3001, () => {
  console.log('realm-on-express is listening on http://localhost:3001');
});
