<h1 align="center">React Quick Query</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/react-quick-query">
    <img src="https://img.shields.io/npm/v/react-quick-query.svg" alt="NPM Version">
  </a>
  <a href="https://www.npmjs.com/package/react-quick-query">
    <img src="https://img.shields.io/npm/dt/react-quick-query.svg" alt="Downloads">
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/react-quick-query" alt="Bundle Size">
  <img src="https://img.shields.io/github/license/tjn20/react-quick-query" alt="License">
</p>

## Introduction

A simple and lightweight React package for fetching and caching data with Server Component–like behavior — all within client components.

- Effortlessly fetch and cache data across your React app

- Fetch and cache multiple requests concurrently

- Reuse cached data anywhere without redundant requests

- Mutate and update the cache to reflect changes instantly across components

- Automatically invalidate stale cache in the background without manual intervention

- Lightweight and dependency-free — designed for performance and simplicity

- Ideal for creating seamless hybrid data-fetching experiences

## Installation

Install from NPM

```
npm i react-quick-query
```

## Usage

- Any HTTP client or data requester can be used -- such as `fetch` or `axios`.
- There's no need to manage loading or error states—unless you’re using React Suspense—only the data itself.
- By the package comes with three hooks to use `useQuery`, `mutateQuery`, and `invalidateQueries`.

## Properties Available with `useQuery<T>()`

The `useQuery` hook allows you to request and cache data.

|             | Description                                                                                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`       | A unique key used to identify the query.                                                                                                                                                                  |
| `fn`        | Any function that returns a promise that resolves the data. However, if you don't want to populate errors and handle them in the parent component, then you should catch them return `undefined` instead. |
| `cache`     | Boolean whether you want to cache the query. `true` by default.                                                                                                                                           |
| `cacheTime` | If you choose to cache the query, you can specify how long (in milliseconds) it should remain cached before being invalidated. The default is `5 minutes`.                                                |

## Examples

## React Suspense

Child Component

```js
import { useQuery } from "react-quick-query";

type Profile = {
  name:string
  phone:number
}

export const Profile = () => {
  const userId = 12; // An example
  const {name,phone} = useQuery<Profile>({
    key:`user-${userId}`,
    fn:()=> axios.get("profile").then((result)=>result), // The returned results must always match the type defined by the generic.
  })
  return (
    <h1>{name}</h1>
  )
};
```

Parent Component

```js
import { Suspense } from "react";
import { Profile } from "./components/profile";
export const Settings = () => {
  return (
    <div>
      {/* Other components or Suspense-wrapped components */}
      <ErrorBoundary>
        {/* Any error boundary component */}
        <Suspense fallback={<Loader />}>
          <Profile />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
```

## Non-Cached Query/ Handling failed requests

If the page might rerender at some point, then this will cause to make continous requests to the server. Therefore, wrap it in a `useMemo`. A useful example for this is `ContextProviders`.

```js
import { useQuery } from "react-quick-query";
import { useMemo } from "react";

type User = {
  name:string
  phone:number,
  //
}

export const User = () => {
  const userId = 10; // An example
  const data = useMemo(()=>useQuery<User | undefined>({
    key:`user-${userId}`,
    fn:()=> axios.get("user").then((result)=>result).catch((error)=>{
        // show a toaster
        return undefined
    }),
    cache:false
  }),[])

  if(!data) return <component-you-want/>
  return (
    <h1>{data.name}</h1>
  )
};
```

## Parallel Queries

Requests are executed concurrently, allowing multiple queries to run in parallel.

```js
import { useQuery } from "react-quick-query";


export const vehicles = () => {
  const cars = useQuery<Car[]>({
    key:`cars`,
    fn:()=> axios.get("cars").then((result)=>result),
    cacheTime: 500000 // 8 minutes and 20 seconds
  })

  const boats = useQuery<Boat[]>({
    key:`boats`,
    fn:()=> axios.get("boats").then((result)=>result),
    cacheTime: 500000 // 8 minutes and 20 seconds
  })
};
```

## Properties Available with `mutateQuery<T>()`

The `mutateQuery` hook allows you to mutate/update cached data.

|           | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| `key`     | The key of the query to mutate.                                  |
| `updater` | A callback function with the cached data of the query to update. |

## Example

```js

axios.post("/route",data).then((data)=>{
  mutateQuery<User[]>("user",(old)=>{
    retun [...old,...data] // Modify as desired
  })
})

```

## Properties Available with `invalidateQueries()`

The `invalidateQueries` hook allows you to immediately invalidate queries or after a specified delay.

|         | Description                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `key`   | The key of the query to invalidate.                                                                                              |
| `after` | How long (in milliseconds) the cache should remain before being invalidated. If `undefined`, it will be invalidated immediately. |

## Example

```js
invalidateQueries([
  {
    key: "users",
    after: 10000,
  },
  {
    key: "cars",
  },
]);
```

## Properties Available with `extendCache()`

The `extendCache` hook allows you to extend the cache time for a query.

|           | Description                                                     |
| --------- | --------------------------------------------------------------- |
| `key`     | The key of the query to extend.                                 |
| `extraMs` | The additional time in milliseconds to extend the cache expiry. |

## Example

```js
extendCache("users", 30000);
```
