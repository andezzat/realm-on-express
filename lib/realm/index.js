const Realm = require('realm');
const _ = require('lodash');

const createRealm = (schema, schemaVersion, path) => {
  if (!schemaVersion) {
    schemaVersion = 0;
  }
  if (!path) {
    path = 'default.realm';
  }
  return new Realm({
    schema,
    schemaVersion,
    path
  })
}

const writeToRealm = (realm, writes) => {
  realm.write(() => {
    writes.forEach((write) => {
      executeWrite(realm, write.schema, write.object, write.action, write.filter, write.property);
    });
  });
}

const executeWrite = (realm, schema, object, action, filter, property) => {
  if (!action) {
    action = 'add';
  }
  if (action === 'add') {
    realm.create(schema, object);
  } else if (action === 'nest') {
    let objectToPushTo = realm.objects(schema).filtered(filter)["0"];
    if (objectToPushTo.hasOwnProperty(property)) {
      let list = objectToPushTo[property];
      if (!list) {
        list = [];
      }
      list.push(object);
    } else {
      throw {
        message: "The property you're attempting to access does not exist.",
      }
    }
  } else if (action === 'update') {
    realm.create(schema, object, true);
  } else if (action === 'updateMultiple') {
    let objectsToUpdate = realm.objects(schema).filtered(filter);
    // console.log(objectsToUpdate);
    _.forEach(objectsToUpdate, (objectToUpdate) => {
      if (!objectToUpdate) {
        console.log('SHIT!');
      }
      // console.log(objectToUpdate);
      for (var key in object) {
        if (!objectToUpdate) {
          console.log('SHIT!!!!');
        }
        // console.log(objectToUpdate.id, objectToUpdate[key], ' = ', object[key]);
        console.log(objectToUpdate[key] = 'NILL');
        // if (object.hasOwnProperty(key)) {
        //   objectToUpdate[key] = object[key];
        // }
      }
    });
  } else if (action === 'delete') {
    let objectToDelete = realm.objects(schema).filtered(filter);
    realm.delete(objectToDelete)
  } else if (action === 'deleteAll') {
    let objectToDelete = realm.objects(schema);
    realm.delete(objectToDelete);
  }
}

const fetchSchema = (realm) => {
  return realm.schema
}

const fetchSchemaVersion = (path) => {
  if (!path) {
    path = Realm.defaultPath;
  }
  return Realm.schemaVersion(path);
}

module.exports = {
  createRealm,
  writeToRealm,
  fetchSchema,
  fetchSchemaVersion,
}
