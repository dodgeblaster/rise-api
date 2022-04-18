# Frontend

How should a frontend client such as a React app interact with a Rise Api? By executing a HTTP POST method against the rise endpoint with an action and input payload defined in the body.

## Example Rise API app with fetch call

Lets take the following example rise api:

```js
module.exports = {
    api: {
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
                    sk: 'note_{@id}',
                    content: '$content'
                }
            }
        ]
    },
    config: {
        name: 'exampleA'
    }
}
```

The fetch call we would make to create a note would look like the following:

```js
const result = await fetch(URL, {
    method: 'POST',
    body: JSON.stringify({
        action: 'makeNote',
        input: {
            content: '1234'
        }
    })
})
```

If we were to add auth to the app:

```js
module.exports = {
    api: ...
    config: {
        name: 'exampleA',
        auth: true
    }
}
```

We would need to include a cognito jwt as an authorization header:

```js
const result = await fetch(URL, {
    method: 'POST',
    body: JSON.stringify({
        action: 'makeNote',
        input: {
            content: '1234'
        }
    }),
    headers: {
        Authorization: 'Bearer ' + jwt
    }
})
```

# React Hook Recipes

## useRiseQuery

```js
import { Auth } from 'aws-amplify'
import useSWR from 'swr'

const getToken = async () => {
    return (await Auth.currentSession()).getIdToken().getJwtToken()
}

const fetcher = async (props) => {
    const jwt = await getToken()
    const URL = process.env.RISE_ENDPOINT

    const riseInput = JSON.parse(props)
    const action = riseInput.action
    const input = riseInput.input

    return fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
            action: action,
            input
        }),
        headers: {
            Authorization: 'Bearer ' + jwt
        }
    }).then((x) => x.json())
}

export const useRiseQuery = (props) => {
    // Stringify props so that SWR can use the string as a key
    // in its cache
    const { data, error } = useSWR(JSON.stringify(props), fetcher)
    const loading = !error && !data
    return [data, loading, error]
}
```

## useRiseMutation

```js
import { Auth } from 'aws-amplify'
import { useSWRConfig } from 'swr'

const getToken = async () => {
    return (await Auth.currentSession()).getIdToken().getJwtToken()
}

export const useRiseMutation = (props) => {
    const { mutate } = useSWRConfig()

    const URL = process.env.RISE_ENDPOINT
    const makeApiCall = async (input) => {
        const jwt = await getToken()
        return fetch(URL, {
            method: 'POST',
            body: JSON.stringify({
                action: props.action,
                input: input
            }),
            headers: {
                Authorization: 'Bearer ' + jwt
            }
        }).then((x) => {
            for (const m of props.invalidate || []) {
                // Stringify mutation in order to create cache key,
                // which we invalidate by passing into mutate
                mutate(JSON.stringify(m))
            }
            return x.json()
        })
    }

    return [makeApiCall]
}
```

## useRiseSocket (Experimental)

```js
import { useState, useEffect } from 'react'
import { Buffer } from 'buffer'
import { Auth } from 'aws-amplify'

const getToken = async () => {
  return (await Auth.currentSession()).getAccessToken().getJwtToken()
}

const initMessages[] = []
export const useRiseSocket = (props) => {
  const [messages, setMessages] = useState(initMessages)
  const [connecting, setConnecting] = useState(true)
  const URL = process.env.RISE_SOCKET_ENDPOINT
  let interval

  const execute = async () => {
    /**
     * Setup Websocket Connection
     */
    const url = URL
    const jwt = await getToken()
    const headers = Buffer.from(
      JSON.stringify({
        jwt: jwt,
      })
    ).toString('base64')
    const urlWithHeaders = `${url}?header=${headers}`
    const socket = new WebSocket(urlWithHeaders)

    /**
     * On Open
     */
    let subId = null
    socket.addEventListener('open', (e) => {
      console.log('WebSocket is connected')
      const payload = {
        action: 'sendMessage',
        data: {
          channel: 'RISE_CONNECTION_INFO',
          payload: {},
        },
      }
      socket.send(JSON.stringify(payload))
    })

    /**
     * On Error
     */
    socket.addEventListener('error', (e) =>
      console.error('WebSocket is in error', e)
    )

    /**
     * On Message
     */
    const isRiseConnectionInfo = (str) => {
      const e = JSON.parse(str)
      if (Object.keys(e).length !== 1) return false
      if (!e.connectionId) return false
      return e.connectionId
    }
    const isRiseKeepAliveMessage = (str) => {
      const e = JSON.parse(str)
      if (Object.keys(e).length !== 1) return false
      if (!e.KEEPALIVE) return false
      return e.KEEPALIVE
    }
    socket.addEventListener('message', (e) => {
      // Handle Rise Connection Info Message
      if (isRiseConnectionInfo(e.data)) {
        subId = isRiseConnectionInfo(e.data)
        const payload = {
          action: 'sendMessage',
          data: {
            channel: 'RISE_CONNECT',
            payload: {
              connection: props.connection,
              jwt: jwt,
              id: subId,
              input: props.input,
            },
          },
        }
        socket.send(JSON.stringify(payload))
        setConnecting(false)
        return
      }

      // Handle to Keep Alive Message
      if (isRiseKeepAliveMessage(e.data)) {
        console.log('keepalive received')
        return
      }

      //  Handle all other messages
      setMessages((m) => [...m, JSON.parse(e.data)])
    })

    /**
     * Send Keep Alive Messages to backend from client
     * every 5 minutes in order to keep connection alive
     */
    const MINUTE = 60000
    const FIVE_MINUTES = 5 * MINUTE
    interval = setInterval(() => {
      console.log('sending keepalive')
      const payload = {
        action: 'sendMessage',
        data: {
          channel: 'RISE_KEEPALIVE',
          payload: {},
        },
      }
      socket.send(JSON.stringify(payload))
    }, FIVE_MINUTES)
  }

  useEffect(() => {
    execute()
  }, [])

  const unsubscribe = () => {
    clearInterval(interval)
  }

  return [messages, connecting, unsubscribe]
}


```
