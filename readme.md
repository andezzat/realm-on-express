# Realm on Express

### Overview
This is a simple [Realm](http://realm.io) [Node.js](https://realm.io/news/first-object-database-realm-node-js-server/) database running on an Express server (Realm on Express).
The user can send HTTP requests and get responses from the server depending on what was requested.
It doesn't do an awful lot right now.
You can do basic things like:
- Add/Get/Update/Delete objects to/from schema
- Update the schema itself
- Get meta information on the Realm (path, schemaVersion, schema)

#### Persistence
The schema and schemaVersion are constantly saved to another Realm called `metaRealm`. It stores objects in a schema called `meta` of your default Realm's `schema` and `schemaVersion`.

## Quick Start
- Use `npm start` to begin
- Use [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) to send `GET`/`POST` requests
- Lets' try something like a `GET` request for `localhost:3001`, you should get a response back with the current details of the database.
- Let's try a simple add, there is a dummy schema on there to get you started.
- Send a `POST` request to `localhost:3001/add/Dog` and in the body, attach a JSON object as such:
```
{
  "id": 1,
  "name": "Rush",
  "age": 4.5,
  "breed": "Golden Retriever"
}
```
- This will add the Dog you sent under the Dog schema in the Realm.
- To find all Dogs, simply `GET` `localhost:3001/Dog/all`, this will retrieve all Dog schema objects from the Realm.

### Resources
#### Realm
[Getting Started](https://realm.io/docs/react-native/latest/#getting-started)
[API Documentation](https://realm.io/docs/react-native/0.15.0/api/)
