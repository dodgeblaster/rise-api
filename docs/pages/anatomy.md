# Anatomy

Here is an example rise file:

```js
module.exports = {
    api: {
        listNotes: [
            {
                type: 'db',
                action: 'list',
                input: {
                    pk: 'notes',
                    sk: 'note_'
                }
            },
            {
                type: 'output',
                id: 'string',
                content: 'string'
            }
        ],
        makeNote: [
            {
                type: 'input',
                content: 'string'
            },
            {
                type: 'db',
                action: 'set',
                input: {
                    pk: 'notes',
                    sk: '@id',
                    content: '$content'
                }
            },
            {
                type: 'output',
                id: 'string',
                content: 'string'
            }
        ]
    },
    events: {
        authorAdded: [
            {
                type: 'event-source',
                source: 'coreservice',
                event: 'authoradded{@stage}'
            },
            {
                type: 'db',
                action: 'set',
                input: {
                    pk: 'author',
                    sk: '$id',
                    ame: '$name'
                }
            }
        ]
    },
    config: {
        name: 'myApp',
        region: 'us-east-2',
        auth: true
    }
}
```

Here we see 3 top level properties:

-   api
-   events
-   config

## API

Each rise project when deployed will have 1 endpoint that receives post requests. This is inspired by GraphQL, and instead relies on concepts like Queries and Mutations rather than http verbs such as GET, POST, PUT, DELETE.

Every property in the api object can be posted to from the frontend, here is an example:

```js
const data = {
    action: 'makeNote',
    input: {
        content: 'my note'
    }
}

const result = await document.fetch(URL, {
    method: 'POST',
    body: JSON.stringify(data)
})
```

Some actions will be get or list calls, some will involve changing data. Rise doesnt distinguish between the 2, all you need to do is specify which action you want to make in the body of your POST call against the deployed url.

## Events

Events represent responses to AWS EventBridge events. Each event must have event source information inside of it in order to know which event it is listening to.

## Config

The root rise.js file requires a config to be defined.

```js
module.exports = {
   api: ...,
   events: ...,
   config: {
       name: 'blue-app',         // required
       region: 'us-east-1',      // not required, default: 'us-east-1'
       stage: 'prod',            // not required, default: 'dev'
       auth: true,               // not required, default: false
       eventBus: 'my-event-bus', // not required, default: false
       profile: 'personal'       // not required, default: "default"
   }
}
```

### name

Determines the name of your api

### region

Determines the AWS region you want to deploy your api into

### stage

Determines the stage you want to use. This amounts to adding a suffix to all Cloudformation resources to differentiate them from other apis deployed with a different stage

### auth

When set to false, your api's primary authentication mode is api key. This should be considered public. When this value is set to true, Rise will generate Cloudformation for a Cognito User Pool and Client, and set the api's primary authentication mode to Cognito

### eventBus

Determines what Eventbridge event bus to use for emit-event and receive-event actions

### profile

Determines what AWS Credentials profile to use
