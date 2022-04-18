# Rise Api

## Intro

Rise helps you build serverless apis with 1 javascript file. Underneath the hood, rise will create the following resources when deployed via the cli:

-   Api Gateway
-   Lambda
-   DynamoDB
-   EventBridge
-   Cognito

This project helps you accomplish:

-   Fast interactions
-   Simple business logic
-   Store records in a fast DB (DynamoDB)
-   Handle authentication, permissions, and access control (Cognito)
-   Pass already authenticated events to the rest of your backend (EventBridge)
-   Make websockets easy to implement (ApiGateway, still in development)

## Getting started with the CLI

You can get started by globally npm installing rise-cli:

```
npm i -g risecli
```

This will globally install rise allowing you to deploy valid riseapps by running the following command in your terminal:

```
rise deploy

```

To delete an appsync api, run

```
rise remove
```

## What does an Rise definition look like?

Every Rise app must have an rise.js file at the root of the project. You can optionally create multiple modules with their own rise.js file as well. An example rise.js file looks like this:

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

rise.js files can have an Api section, Events section, and if its the root rise.js file, a config. Api and Events have arrays of actions. These actions cover common usecases like DynamoDB CRUDL operations, Eventbridge emit actions and permission checks. Config defines the configuration for your app such as name, region, auth, and so on.

## How does the folder structure work?

Small apis may only need 1 js file, in which case your folder structure would look like this:

```
rise.js
```

Larger Rise projects can benefit from modules. Rise follows a convention based approach. All modules must be inside a modules folder. Each folder inside the modules folder represents a single module. Each module will contain a rise.js file (Note: only the root rise.js file needs to have config defined). Here is what the folder structure of a larger project might look like:

```
rise.js
/modules
    /hats
        rise.js
    /shirts
        rise.js
    /shoes
        rise.js
```

## What flags can you pass to the CLI?

When deploying or removing, you can pass the following flags:

```
rise deploy --stage=prod --region=us-east-2 --ci=true --profile=personal
```

Region and stage set the AWS region and deployment stage of your api. Setting ci to true will cause the cli to skip saving the Cloudformation template to your file system (good for when you run the cli in a ci pipeline). profile determines the aws credentials profile you would like to use to deploy your project.

## How do I setup AWS Credentials for local or CI Pipeline context?

Locally, you can use your own AWS credentials. Check this video out if this is the first time you are setting up AWS credentials.

Inside a CI Pipeline like Github Actions, you can set credentials up by setting environment variables like so:

```
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx rise deploy
```

Usually ci platforms have a way to store secrets in the environment. Never hardcode credentials in a github repository. An example of referencing Github Action secrets is as follows:

```
AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY }}
```

## How do I define a DynamoDB database?

Every Rise api automatically deploys a DynamoDB table with a predefined structure (defining your own DynamoDB database structure is on the roadmap). The database structure of your project's database is as follows:

### First Index

```
pk: Hash Key
sk: Sort Key
```

### Second Index

```
pk2: Hash Key
sk:  Sort Key
```

### Third Index

```
pk3: Hash Key
sk:  Sort Key
```
