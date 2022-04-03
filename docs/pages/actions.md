# Actions

Each api or event contains an array of "actions". Here is an example:

```js
module.exports = {
    api: {
        createPost: [
            {
                type: 'add',
                pk: 'my-notes',
                sk: 'note_@id'
            },
            {
                type: 'db',
                action: 'set'
            }
        ]
    }
}
```

In the above example, each object in the array represents an action we want to perform. The first action adds pk and sk to the state. The second action will put the state into your rise api's DynamoDB table.

## Available Actions

### Database Actions

Database actions will take whatever is in state and perform a database call with that data

```js
{
    type: 'db',
    action: 'get'
}
{
    type: 'db',
    action: 'list'
}
{
    type: 'db',
    action: 'set'
}
{
    type: 'db',
    action: 'remove'
}
```

You can alternatively define the input of each db action for more control. This works well when what is in state does not correspond to what db call you want to make.

```js
{
    type: 'db',
    action: 'get',
    input: {
        pk: 'note',
        sk: '123'
    }
}
{
    type: 'db',
    action: 'list',
    input: {
        pk: 'notes',
        sk: 'note_'
    }
}
{
    type: 'db',
    action: 'set',
    input: {
        pk: 'note',
        sk: '123'
    }
}
{
    type: 'db',
    action: 'remove',
    input: {
        pk: 'note',
        sk: '123'
    }
}
```

### Add Actions

Add action will add this value to the input of the resolver. In the example below we can see the @id keyword being used, which will be replaced with a UUID

```js
{
    type: 'add',
    sk: 'account_{@id}'
}
```

### Guard Actions

Guard will query the database using the pk and sk values provided. If it successfully finds the item, the next actions in the array will execute. If it does not find the item, it will throw an unauthorized error, stopping any further exection. This usually is an action you chain with others in order to protect certain queries or mutations.

Here we also see the !sub keyword. ! represents the cognito user. In this case, we are referencing sub value on the cognito user object. This object will be present if the incoming api call is authenticated with a cognito JWT. This only works if you have configured your project to use cognito user pools by setting auth to true in the config of the root rise.js file.

```js
{
    type: 'guard',
    pk: 'admins',
    sK: 'member_{!sub}'
}
```

### Emit Event Action

Emit actions will emit a event bridge event. In order to use this action, you must have an eventBus defined in the config of your root rise.js file. In the example below, we can see the use of the # character. This will reference the result from the last db action.

```js
{
    type: 'emit-event',
    event: 'startProcess',
    input: {
        pk: '$pk',
        sk: '$sk',
        status: 'starting'
    }
}
```

## Keywords

When defining actions, it is helpful to reference different values

### Random ID: @id

Creating a random id for new items is a common part of CRUDL apps. This can be done with the '@id' keyword:

```js
{
    type: 'add',
    pk: 'note',
    sk: 'note_{@id}'
}
```

### Timestamp: @now

```js
{
    type: 'add',
    pk: 'events',
    sk: 'event_{@now}'
}
```

### Today: @today

```js
{
    type: 'add',
    pk: 'events',
    sk: 'event_{@today}' // 2022-02-02
}
```

### Input: $

Input from the api post calls body, or details in event bridge events, will automatically be added to state. There may be times you want to assign values in state in an action. This can be set with the $ character:

```js
{
    type: 'add',
    pk: '$type',
    sk: '$id'
}
```

### Cognito User: !

The user object provided by the logged in Cognito user can be referenced with ! character

```js
{
    type: 'add',
    pk: 'account-information',
    sk: '!sub',
    email: '!email'
}
```
