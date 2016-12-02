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

## [Quick Start](#quick-start)
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

## Features
#### Note
All writes (add, update or delete) take `POST` requests, and anything that only reads (get), will simply take a `GET` request.
### Add Object
To add an object, simply send a `POST` request to `localhost:3001/add/:schema` and in the body attach a JSON object as shown in the [quick start](#quick-start) guide!
`:schema` represents a schema you have in your Realm, eg. `Car`, `Dog` or whatever else you may have created!
### Add Nested Object
Objects nested within other objects can be added too!
Here's an example. If I have a Realm schema as such:
```
[
  {
    "name": "Person",
    "primaryKey": "id",
    "properties": {
      "id": "int",
      "name": "string",
      "age": "double",
      "animals": { "type": "list", "objectType": "Animal" }
    }
  },
  {
    "name": "Animal",
    "primaryKey": "id",
    "properties": {
      "id": "int",
      "name": "string",
      "species": "string",
      "age": { "type": "double", "optional": true }
    }
  }
]
```
And say I already have a person, and they have a nested property of type `Animal` called `animals` that I'd like to add to. I can tell `realm-on-express` all the information it needs to do that.
Here's an example of how:
`POST` request to `localhost:3001/add/Person/nest?filter=id = 5&property=animals`, I've left spaces in the request URI, but that's ok because it will usually be encoded by Postman or you would use a function to do that for you etc.

So to sum up, this is how it's done in more detailed explanation. `POST` to `localhost:3001/add/:schema/nest?filter={YOUR_FILTER_HERE}&property={YOUR_PROPERTY_HERE}`
 - `:schema` represents the name of the schema of the object you are adding to, not the object you'd like to nest. This would be `Person` in our example.
 - `{YOUR_FILTER_HERE}` will be replaced by a filter you specify in order to find that specific `Person` that you would like to nest your object to. It is recommended that you use something unique, in our case that's the primary key which is `id`. So it'd be something like `id = 7`. If you'd like to nest the same object to multiple objects of the same schema (One `Animal` to multiple `Person`), then use the filter to specify that group of objects that you'd like to have your nested object in. As long as they all have the same nested property, then you'll be fine!
 - `{YOUR_PROPERTY_HERE}` will be replaced by the name of the property where the nested objects are kept in your main object. In the example above it was named `animals`.

### Get Object
To get an object from the Realm, simply send a `GET` request to `localhost:3001/get/:schema/:id`. Eg. if you `GET` to `localhost:3001/get/Car/4`, then you will get back a response, the body of which will contain something like:
```
{
  "results": {
    "0": {
	  "id": 4,
	  "make": "Toyota",
	  "model": "Corolla",
	  "year": "1997",
	  "odometer": 120551
    }
  }
}
```
If you're already familiar with Realm's results objects, you will immediately notice how this is exactly the same. The results object contains properties for each object fetched from the Realm accessible by doing a simple `resultFromRealm["0"]` for the first result for example, in our case that's the only one.
### Get Multiple Objects
There are 2 ways to fetch multiple objects from the Realm as of now. Both are `GET` requests, but they differ slightly.
#### Queries
In order to fetch objects based on a query, do the following: send a `GET` request to `localhost:3001/get/:schema?filter={YOUR_FILTER_HERE}`, where `{YOUR_FILTER_HERE}` is simply the same syntax you would use for the [Realm `filtered()` function](https://realm.io/docs/react-native/latest/#filtering). If you use Postman, you can type your filter string as you would plain text, eg. name = "Rush", and it will automatically encode the URI before sending off the request (spaces become `%20`s etc...).
#### All Objects for Schema
It's very easy to fetch all objects for a specific schema from the Realm.
Simply send off a `GET` request to `localhost:3001/get/:schema/all` and you will get a results object back with all objects stored in your Realm with said schema.
### Update Object by Primary Key
In order to update an object for a schema, send a `POST` request to `localhost:3001/update/:schema` and in the body place the object used to update. It should contain the primary key of the object you're updating and the properties you're changing.
Eg. to update a `Dog` of `id` 5 with a new `name`:
`POST` to `localhost:3001/update/Dog` with a body of:
```
{
  "id": 5,
  "name": "Winston"
}
```
You can add as many properties as you'd like to update.
This is the fastest way to update an object as it uses its unique primary key to find it and change its properties.

### Resources
#### Realm
[Getting Started](https://realm.io/docs/react-native/latest/#getting-started)
[API Documentation](https://realm.io/docs/react-native/0.15.0/api/)
