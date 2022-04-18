# Actions

Each api or event contains an array of "actions". Here is an example:

```js
module.exports = {
    api: {
        createPost: [
            {
                type: 'input',
                content: 'string'
            },
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

When `createPost` or any other api action is executed, it starts off with an empty state object. When values are added to the state, it persists through out the execution of the action and is made available to every step inside the action. Values can be added to the state by the steps inside the action. Lets look at an example:

```js
module.exports = {
    api: {
        createPost: [
            /* 
            At the very beginning, there is nothing in the state:

            {}
            */
            {
                type: 'input',
                content: 'string'
            },
            /* 
            The input step defines what values need to be posted to this action, and 
            throws a 400 response if these values are not included in the POST body. 
            Once these values have been confirmed to be part of the POST body, this 
            step will add them to the state:

            {
                content: "Hello"
            }
            */
            {
                type: 'add',
                pk: 'my-notes',
                sk: 'note_@id'
            },
            /* 
            The add action will add values to the state. This is great for ids or 
            for business logic

            {
                 content: "Hello"
                 pk: 'my-notes',
                 sk: 'note_12nhj234-jn23jn34-kjn34'
            }
            */
            {
                type: 'db',
                action: 'set'
            }
            /* 
            The db steps will do actions against the db. It gets its input in 2 ways:
            1. It will take whatever is in the state, and use that to make its 
               queries and mutations
            2. If an input value is defined, it will only use what is defined 
               (more details below)
            */
        ]
    }
}
```

## Available Steps

### Input Steps

_Required: type_

Input steps define what input must be present in the POST's body. It will throw a 400 error if they are not
present. Once all values have been confirmed, this step will add each value to the state of the action. When
defining the input, you specify the property and the typeof value.

```js
{
    type: 'input',
    name: 'string',
    age: 'number'
}
```

### Database Step

_Required: type, action_

Database steps will take whatever is in state and perform a database call with that data

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

Alternatively, you can define the input of each db step for more control. This works well when what is in the state does not correspond to what db call you want to make.

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

### Add Steps

_Required: type_

Add step will add values to the state. In the example below we can see the @id keyword being used, which will be replaced with a UUID (more on the @id keyword below)

```js
{
    type: 'add',
    sk: 'account_{@id}'
}
```

### Guard Steps

_Required: type, pk, sk_

Guard will query the database using the pk and sk values provided. If it successfully finds the item, the next steps in the array will execute. If it does not find the item, it will throw an unauthorized error, stopping any further exection. This usually is a step you chain with others in order to protect certain queries or mutations.

Here we also see the !sub keyword. ! represents the cognito user. In this case, we are referencing sub value on the cognito user object (more on the !sub keyword below).

```js
{
    type: 'guard',
    pk: 'admins',
    sK: 'member_{!sub}'
}
```

### Emit Event Steps

_Required: type, event, input_

Emit steps will emit an event bridge event. In order to use this step, you must have an eventBus defined in the config of your root rise.js file.

```js
{
    type: 'emit',
    event: 'startProcess',
    input: {
        pk: '$pk',
        sk: '$sk',
        status: 'starting'
    }
}
```

## Keywords

Each keyword is prefixed with the @ symbol. Example:

```js
myValue: '@id'
```

If you want to use a keyword in the middle of a string, you must surround it with {}, example:

```js
myValue: 'note_{@id}'
```

### Random ID: @id

@id creates a random id

```js
{
    type: 'add',
    pk: 'note',
    sk: 'note_{@id}' // note_234234d-ederfe-34f3f
}
```

### Timestamp: @now

```js
{
    type: 'add',
    pk: 'events',
    sk: 'event_{@now}' // event_163474523450
}
```

## References

### State: $

Steps in a Rise Action include state, which can be added to. Often we will want to reference that state and use it in future steps such as db calls, event emitting, and defining return values. Properties on the state object
can be referenced with the $ symbol. Example:

```js
{
    type: 'add',
    pk: '$type',
    sk: '$id'
}
```

If state needs to be used within a string, the reference must be surrounded by {}, example:

```js
{
    type: 'add',
    pk: 'notes_{$type}',
    sk: 'note_{$id}'
}
```

### Cognito User: !

Often permissions are determined by which logged in user is making the HTTP POST call. This can be
determined by getting the users id off of the JWT provided in the Authorization header. Rise handles parsing
this JWT for you. Properties on the JWT object can be referenced with the ! symbol, Example:

```js
{
    type: 'add',
    pk: 'account-information',
    sk: '!sub',
    email: '!email'
}
```

If values needs to be used within a string, the reference must be surrounded by {}, example:

```js
{
    type: 'add',
    pk: 'account-information',
    sk: 'user_{!sub}',
    email: '!email'
}
```
