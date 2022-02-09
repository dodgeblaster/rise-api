# Rise Api

## Intro

Rise Api is a CLI that deploys a serverless application based on:

-   Api Gateway
-   Lambda
-   DynamoDB
-   EventBridge
-   AppSync
-   Cognito

This CLI aims to provide a simple abstraction overtop of those resources so you can focus on your applications logic, and have the neccessary AWS resources deployed in response to your logic.

Rise Api also has a strong opinion on how to structure a serverless project for frontend clients. Interactions the frontend makes to the backend are known as hot paths. These should be as fast and simple as possible. Long running tasks or heavy logic should happen async behind the scenes, and should be located outside the hot path (Rise Focus is a great solution for these usecases). Rise Api aims to accomplish:

-   Fast interactions
-   Simple business logic
-   Store state or records in a fast DB (DynamoDB)
-   Handle authentication, permissions, and access control (Cognito)
-   Pass already authenticated events to the rest of your backend (EventBridge)
-   Make websockets easy to implement (Appsync)

## Install

```ts
npm i -g risecli
```

## Usage

Deploy

```ts
rise deploy
```

## Project Structure

A rise api project as the following structure:

```
/modules
    moduleA.js
    moduleB.js
    moduleC.js
rise.js
```

## What is the rise.js file for?

Every rise project has at least a `rise.js` file which has 3 things:

-   api
-   events
-   config

A rise file is structured as follows:

```js
module.exports = {
    api: {
        apiAction1: [...actions],
        apiAction2: [...actions]
    },
    events: {
        event1: [...actions],
        event2: [...actions]
    },
    config: {
        name: 'myAppsName',
        region: 'us-east-1', // optional
        stage: 'dev', // optional
        auth: true, // optional
        eventBus: 'default' // optional
    }
}
```

A Rise app can respond to POST requests by defining arrays of actions in the api section, and response to EventBridge events by defining arrays of actions in the events section. How these are defined are explained in more detail in the Api and the Events pages of these docs.

The config section is how we configure the app itself:

-   `name` is the name of the project
-   `region` is optional, defaults to us-easy-1 if not defined. It is uncommon to hardcode this value here, this is more commonly defined as a flag when using the cli
-   `stare` is optional, defaults to dev if not defined. It is uncommon to hardcode this value here, this is more commonly defined as a flag when using the cli
-   `auth` is optional, defaults to false. If true, the api is protected by a Cognito User Pool
-   `evenBus` is optional, defaults to false. This determines which event bus to emit EventBridge events on.
