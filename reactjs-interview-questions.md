# React 19 Interview Questions - Comprehensive Guide

> Based on official React 19 documentation via Context7 MCP
> Last Updated: December 2025

## Table of Contents

1. [React 19 New Features](#react-19-new-features)
2. [Hooks - Fundamentals](#hooks---fundamentals)
3. [Hooks - Advanced](#hooks---advanced)
4. [Server Components & Actions](#server-components--actions)
5. [Suspense & Concurrent Features](#suspense--concurrent-features)
6. [Performance Optimization](#performance-optimization)
7. [Forms & User Input](#forms--user-input)
8. [Refs & DOM Manipulation](#refs--dom-manipulation)
9. [Context & State Management](#context--state-management)
10. [Component Patterns](#component-patterns)
11. [Activity Component & Selective Hydration](#activity-component--selective-hydration)
12. [Resource Preloading & Document Metadata](#resource-preloading--document-metadata)
13. [Breaking Changes & Migration](#breaking-changes--migration)

---

## React 19 New Features

### Q1: What are the major new features in React 19?

**Answer:**

**1. Actions:**

- Async transitions with automatic pending states
- Optimistic updates
- Error handling
- Forms integration

**2. New Hooks:**

- `use()` - Read promises and Context
- `useActionState()` - Form state management
- `useFormStatus()` - Form submission status
- `useOptimistic()` - Optimistic UI updates

**3. React Server Components:**

- Server-side rendering with zero client JS
- Server Actions for data mutations
- Async components

**4. Improvements:**

- Ref as prop (no more forwardRef needed)
- Better hydration error messages
- Document metadata support
- Stylesheet precedence
- Async script support

### Q2: What is the `use()` hook and how does it work?

**Answer:**
The `use()` hook reads resources like Promises or Context during render. Unlike other hooks, it can be called conditionally.

**Reading Promises:**

```javascript
import { use, Suspense } from "react";

function Comments({ commentsPromise }) {
  // use() will suspend until the promise resolves
  const comments = use(commentsPromise);

  return comments.map((comment) => <p key={comment.id}>{comment.text}</p>);
}

function Page({ commentsPromise }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

**Reading Context:**

```javascript
import { use } from "react";
import ThemeContext from "./ThemeContext";

function Heading({ children }) {
  if (children == null) {
    return null;
  }

  // This works with use() but not useContext
  // because of the early return
  const theme = use(ThemeContext);

  return <h1 style={{ color: theme.color }}>{children}</h1>;
}
```

**Key differences from other hooks:**

- Can be called conditionally and in loops
- Can be called after early returns
- Must be used with Suspense for promises
- Cannot be called in try/catch blocks

### Q3: What are React Server Components and how do they work?

**Answer:**
Server Components render on the server and send HTML to the client with zero client-side JavaScript.

**Server Component:**

```javascript
// Server Component (default)
async function BlogPost({ id }) {
  // Direct database access
  const post = await db.posts.findById(id);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By: {post.author}</p>
      <div>{post.content}</div>
    </article>
  );
}
```

**Composing with Client Components:**

```javascript
// Server Component
import Expandable from "./Expandable"; // Client Component

async function Notes() {
  const notes = await db.notes.getAll();

  return (
    <div>
      {notes.map((note) => (
        <Expandable key={note.id}>
          <p>{note.content}</p>
        </Expandable>
      ))}
    </div>
  );
}
```

```javascript
// Client Component
"use client";

import { useState } from "react";

export default function Expandable({ children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>Toggle</button>
      {expanded && children}
    </div>
  );
}
```

**Benefits:**

- Zero client-side JavaScript for static content
- Direct database/API access
- Automatic code splitting
- Better SEO
- Reduced bundle size

**Limitations:**

- Cannot use hooks (useState, useEffect, etc.)
- Cannot use browser APIs
- Cannot use event handlers

---

## Hooks - Fundamentals

### Q4: How does `useState` work and what are its best practices?

**Answer:**

**Basic usage:**

```javascript
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

**Multiple state variables:**

```javascript
function Form() {
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState("");

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={age} onChange={(e) => setAge(Number(e.target.value))} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </form>
  );
}
```

**Functional updates:**

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ Bad: May use stale state
  const increment = () => setCount(count + 1);

  // ✅ Good: Always uses latest state
  const increment = () => setCount((c) => c + 1);

  return <button onClick={increment}>Count: {count}</button>;
}
```

**Lazy initialization:**

```javascript
function ExpensiveComponent() {
  // ❌ Bad: Runs on every render
  const [state, setState] = useState(expensiveComputation());

  // ✅ Good: Runs only once
  const [state, setState] = useState(() => expensiveComputation());
}
```

**Best practices:**

- Use functional updates when new state depends on old state
- Use lazy initialization for expensive computations
- Keep state minimal and derived values in render
- Don't duplicate props in state

### Q5: How does `useEffect` work and what are common patterns?

**Answer:**

**Basic effect:**

```javascript
import { useState, useEffect } from "react";

function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState("https://localhost:1234");

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();

    // Cleanup function
    return () => {
      connection.disconnect();
    };
  }, [serverUrl, roomId]); // Dependencies

  return <div>Connected to {roomId}</div>;
}
```

**Effect without cleanup:**

```javascript
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

**Effect with empty dependencies (runs once):**

```javascript
useEffect(() => {
  // Runs only on mount
  const data = fetchData();
  return () => {
    // Runs only on unmount
    cleanup();
  };
}, []);
```

**Common patterns:**

**1. Fetching data:**

```javascript
useEffect(() => {
  let ignore = false;

  async function fetchData() {
    const result = await fetch(`/api/data/${id}`);
    const data = await result.json();

    if (!ignore) {
      setData(data);
    }
  }

  fetchData();

  return () => {
    ignore = true;
  };
}, [id]);
```

**2. Event listeners:**

```javascript
useEffect(() => {
  function handleResize() {
    setWidth(window.innerWidth);
  }

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

**3. Timers:**

```javascript
useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);

  return () => clearInterval(id);
}, []);
```

**Best practices:**

- Always specify dependencies
- Clean up side effects
- Use multiple effects for unrelated logic
- Avoid effects for derived state

---

## Hooks - Advanced

### Q6: How does `useTransition` work and when should you use it?

**Answer:**
`useTransition` marks state updates as non-urgent, keeping the UI responsive during expensive operations.

**Basic usage:**

```javascript
import { useState, useTransition } from "react";

function TabContainer() {
  const [tab, setTab] = useState("about");
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <div>
      <TabButton isActive={tab === "about"} onClick={() => selectTab("about")}>
        About
      </TabButton>
      <TabButton isActive={tab === "posts"} onClick={() => selectTab("posts")}>
        Posts {isPending && "(Loading...)"}
      </TabButton>

      {tab === "about" && <AboutTab />}
      {tab === "posts" && <PostsTab />}
    </div>
  );
}
```

**With async actions:**

```javascript
function CheckoutForm() {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);

  const updateQuantityAction = async (newQuantity) => {
    startTransition(async () => {
      const savedQuantity = await updateQuantity(newQuantity);
      startTransition(() => {
        setQuantity(savedQuantity);
      });
    });
  };

  return (
    <div>
      <button onClick={() => updateQuantityAction(quantity + 1)}>Add</button>
      {isPending && <span>Updating...</span>}
    </div>
  );
}
```

**Benefits:**

- Keeps UI responsive during slow updates
- Prevents unwanted loading states
- Better user experience for navigation
- Works with Suspense boundaries

**When to use:**

- Tab switching
- Search/filtering
- Navigation
- Any non-urgent state update

### Q7: What is `useOptimistic` and how do you implement optimistic updates?

**Answer:**
`useOptimistic` allows you to show optimistic UI updates while an async operation is in progress.

**Basic usage:**

```javascript
import { useOptimistic, useState, useRef } from "react";

function Thread({ messages, sendMessageAction }) {
  const formRef = useRef();
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [
      ...state,
      {
        text: newMessage,
        sending: true,
      },
    ]
  );

  async function formAction(formData) {
    addOptimisticMessage(formData.get("message"));
    formRef.current.reset();
    await sendMessageAction(formData);
  }

  return (
    <>
      {optimisticMessages.map((message, index) => (
        <div key={index}>
          {message.text}
          {message.sending && <small> (Sending...)</small>}
        </div>
      ))}

      <form action={formAction} ref={formRef}>
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
```

**With form state:**

```javascript
function ChangeName({ currentName, onUpdateName }) {
  const [optimisticName, setOptimisticName] = useOptimistic(currentName);

  const submitAction = async (formData) => {
    const newName = formData.get("name");
    setOptimisticName(newName);

    const updatedName = await updateName(newName);
    onUpdateName(updatedName);
  };

  return (
    <form action={submitAction}>
      <p>Your name is: {optimisticName}</p>
      <input
        type="text"
        name="name"
        disabled={currentName !== optimisticName}
      />
      <button type="submit">Change Name</button>
    </form>
  );
}
```

**How it works:**

1. Display optimistic state immediately
2. Perform async operation
3. React automatically reverts or updates to actual state
4. If operation fails, optimistic state is discarded

**Use cases:**

- Chat messages
- Like/unlike buttons
- Form submissions
- Todo list updates
- Any user action with server confirmation

### Q8: How do `useMemo` and `useCallback` work?

**Answer:**

**useMemo - Memoize computed values:**

```javascript
import { useMemo } from "react";

function ProductList({ products, filter }) {
  // Expensive computation
  const filteredProducts = useMemo(() => {
    console.log("Filtering products...");
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

  return (
    <ul>
      {filteredProducts.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

**useCallback - Memoize functions:**

```javascript
import { useCallback } from "react";

function ProductPage({ productId, referrer }) {
  const handleSubmit = useCallback(
    (orderDetails) => {
      post("/product/" + productId + "/buy", {
        referrer,
        orderDetails,
      });
    },
    [productId, referrer]
  );

  return <Form onSubmit={handleSubmit} />;
}
```

**Combined usage:**

```javascript
function ProductPage({ productId, referrer }) {
  const product = useData("/product/" + productId);

  // Memoize computed value
  const requirements = useMemo(() => {
    return computeRequirements(product);
  }, [product]);

  // Memoize function
  const handleSubmit = useCallback(
    (orderDetails) => {
      post("/product/" + productId + "/buy", {
        referrer,
        orderDetails,
      });
    },
    [productId, referrer]
  );

  return <ShippingForm requirements={requirements} onSubmit={handleSubmit} />;
}
```

**useCallback is useMemo for functions:**

```javascript
// These are equivalent:
const handleSubmit = useCallback(
  (data) => {
    // ...
  },
  [deps]
);

const handleSubmit = useMemo(() => {
  return (data) => {
    // ...
  };
}, [deps]);
```

**When to use:**

- Expensive computations (useMemo)
- Passing callbacks to memoized children (useCallback)
- Custom hooks returning functions (useCallback)
- Dependencies in other hooks

**When NOT to use:**

- Simple computations
- Every function/value (premature optimization)
- Without measuring performance impact

### Q9: How does `useReducer` work and when should you use it over `useState`?

**Answer:**

**Basic usage:**

```javascript
import { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
    default:
      throw new Error("Unknown action: " + action.type);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
```

**Complex state management:**

```javascript
function todoReducer(state, action) {
  switch (action.type) {
    case "added":
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    case "changed":
      return state.map((t) => (t.id === action.task.id ? action.task : t));
    case "deleted":
      return state.filter((t) => t.id !== action.id);
    default:
      throw new Error("Unknown action: " + action.type);
  }
}

function TodoList() {
  const [tasks, dispatch] = useReducer(todoReducer, []);

  function handleAddTask(text) {
    dispatch({
      type: "added",
      id: nextId++,
      text: text,
    });
  }

  function handleChangeTask(task) {
    dispatch({
      type: "changed",
      task: task,
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: "deleted",
      id: taskId,
    });
  }

  return (
    <>
      <AddTask onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}
```

**Lazy initialization:**

```javascript
function createInitialState(username) {
  // Expensive computation
  return {
    username,
    todos: loadTodos(username),
  };
}

function TodoApp({ username }) {
  const [state, dispatch] = useReducer(
    reducer,
    username,
    createInitialState // Initializer function
  );
}
```

**Use `useReducer` when:**

- Multiple related state values
- Complex state logic
- Next state depends on previous state
- Want to optimize performance (dispatch is stable)
- Testing state logic separately

**Use `useState` when:**

- Simple, independent state
- Few state updates
- State logic is straightforward

---

## Server Components & Actions

### Q10: What are Server Actions and how do you use them?

**Answer:**
Server Actions are async functions that run on the server, marked with `'use server'`.

**Defining Server Actions:**

```javascript
// actions.js
"use server";

export async function updateName(name) {
  if (!name) {
    return { error: "Name is required" };
  }
  await db.users.updateName(name);
}
```

**Using in forms:**

```javascript
// Client Component
"use client";

import { updateName } from "./actions";

function UpdateName() {
  return (
    <form action={updateName}>
      <input type="text" name="name" />
      <button type="submit">Update</button>
    </form>
  );
}
```

**With useTransition:**

```javascript
"use client";

import { useTransition } from "react";
import { updateName } from "./actions";

function UpdateName() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const submitAction = async () => {
    startTransition(async () => {
      const { error } = await updateName(name);
      if (error) {
        setError(error);
      } else {
        setName("");
      }
    });
  };

  return (
    <form action={submitAction}>
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isPending}
      />
      {error && <span>Failed: {error}</span>}
      <button disabled={isPending}>
        {isPending ? "Updating..." : "Update"}
      </button>
    </form>
  );
}
```

**Inline Server Actions:**

```javascript
// Server Component
import Button from "./Button";

function EmptyNote() {
  async function createNoteAction() {
    "use server";
    await db.notes.create();
  }

  return <Button onClick={createNoteAction} />;
}
```

**Benefits:**

- No need to create API routes
- Type-safe
- Progressive enhancement
- Automatic serialization

---

## Suspense & Concurrent Features

### Q11: How does Suspense work in React 19?

**Answer:**
Suspense lets you display fallback UI while child components are loading.

**Basic usage:**

```javascript
import { Suspense } from "react";

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent />
    </Suspense>
  );
}
```

**With use() hook:**

```javascript
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);

  return comments.map((comment) => <p key={comment.id}>{comment.text}</p>);
}

function Page({ commentsPromise }) {
  return (
    <Suspense fallback={<div>Loading comments...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

**Multiple Suspense boundaries:**

```javascript
function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
    </div>
  );
}
```

**With useDeferredValue:**

```javascript
import { Suspense, useState, useDeferredValue } from "react";

function App() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Suspense fallback={<h2>Loading...</h2>}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}
```

**Error boundaries with Suspense:**

```javascript
function App() {
  return (
    <ErrorBoundary fallback={<div>Failed to load</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <DataComponent promise={fetchData()} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## Performance Optimization

### Q12: How do you optimize React components with `memo`?

**Answer:**

**Basic memoization:**

```javascript
import { memo } from "react";

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
});
```

**Custom comparison:**

```javascript
const MyComponent = memo(
  function MyComponent({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

**With useCallback:**

```javascript
function Parent() {
  const [count, setCount] = useState(0);

  // Memoize callback
  const handleClick = useCallback(() => {
    console.log("Clicked");
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <MemoizedChild onClick={handleClick} />
    </div>
  );
}

const MemoizedChild = memo(function Child({ onClick }) {
  console.log("Child rendered");
  return <button onClick={onClick}>Click me</button>;
});
```

**When to use memo:**

- Component renders often with same props
- Rendering is expensive
- Component is pure
- Props are stable

**When NOT to use:**

- Props change frequently
- Component is already fast
- Premature optimization

### Q13: What are React 19's new ref improvements?

**Answer:**
React 19 allows passing `ref` as a regular prop, eliminating the need for `forwardRef`.

**Before (React 18):**

```javascript
import { forwardRef } from "react";

const MyInput = forwardRef(function MyInput(props, ref) {
  return <input {...props} ref={ref} />;
});
```

**After (React 19):**

```javascript
function MyInput({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}
```

**With useImperativeHandle:**

```javascript
import { useRef, useImperativeHandle } from "react";

function MyInput({ ref }) {
  const inputRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        inputRef.current.focus();
      },
      scrollIntoView() {
        inputRef.current.scrollIntoView();
      },
    }),
    []
  );

  return <input ref={inputRef} />;
}

// Usage
function Form() {
  const ref = useRef(null);

  return (
    <>
      <MyInput ref={ref} />
      <button onClick={() => ref.current.focus()}>Focus input</button>
    </>
  );
}
```

---

## Forms & User Input

### Q14: How do you use `useActionState` for form handling?

**Answer:**

**Basic usage:**

```javascript
import { useActionState } from "react";

async function increment(previousState, formData) {
  return previousState + 1;
}

function StatefulForm() {
  const [state, formAction] = useActionState(increment, 0);

  return (
    <form>
      <p>Count: {state}</p>
      <button formAction={formAction}>Increment</button>
    </form>
  );
}
```

**With validation:**

```javascript
async function addToCart(prevState, formData) {
  const itemID = formData.get("itemID");

  if (!itemID) {
    return { error: "Item ID is required" };
  }

  try {
    await db.cart.add(itemID);
    return { success: true, message: "Added to cart!" };
  } catch (error) {
    return { error: error.message };
  }
}

function AddToCartForm({ itemID, itemTitle }) {
  const [message, formAction, isPending] = useActionState(addToCart, null);

  return (
    <form action={formAction}>
      <h2>{itemTitle}</h2>
      <input type="hidden" name="itemID" value={itemID} />
      <button type="submit" disabled={isPending}>
        Add to Cart
      </button>
      {isPending ? "Loading..." : message?.error || message?.message}
    </form>
  );
}
```

### Q15: How do you use `useFormStatus` to track form submission?

**Answer:**

**Basic usage:**

```javascript
import { useFormStatus } from "react-dom";

function Submit() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

function Form() {
  return (
    <form action={submitAction}>
      <input type="text" name="username" />
      <Submit />
    </form>
  );
}
```

**Accessing form data:**

```javascript
function UsernameForm() {
  const { pending, data } = useFormStatus();

  return (
    <div>
      <input type="text" name="username" disabled={pending} />
      <button type="submit" disabled={pending}>
        Submit
      </button>
      {data && <p>Requesting {data.get("username")}...</p>}
    </div>
  );
}
```

**Important:** `useFormStatus` must be called from a component rendered inside a `<form>`, not from the component that renders the form.

---

## Refs & DOM Manipulation

### Q16: How do you use `useRef` for DOM manipulation?

**Answer:**

**Basic DOM access:**

```javascript
import { useRef } from "react";

function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus input</button>
    </>
  );
}
```

**Storing mutable values:**

```javascript
function Timer() {
  const intervalRef = useRef(null);
  const [count, setCount] = useState(0);

  function start() {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  }

  function stop() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

**Lazy initialization:**

```javascript
function Video() {
  // ❌ Bad: Creates new instance on every render
  const playerRef = useRef(new VideoPlayer());

  // ✅ Good: Creates instance only once
  const playerRef = useRef(null);

  if (playerRef.current === null) {
    playerRef.current = new VideoPlayer();
  }

  return <div ref={playerRef} />;
}
```

**Multiple refs with callback refs:**

```javascript
function ItemList({ items }) {
  const itemsRef = useRef(new Map());

  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          ref={(node) => {
            if (node) {
              itemsRef.current.set(item.id, node);
            } else {
              itemsRef.current.delete(item.id);
            }
          }}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

---

## Context & State Management

### Q17: How do you use Context API effectively?

**Answer:**

**Creating and providing context:**

```javascript
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming context
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

**Using context:**

```javascript
function Button() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      style={{
        background: theme === "dark" ? "#000" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
      }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      Toggle Theme
    </button>
  );
}
```

**Optimizing context updates:**

```javascript
import { useCallback, useMemo } from "react";

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Memoize callback
  const login = useCallback((response) => {
    storeCredentials(response.credentials);
    setCurrentUser(response.user);
  }, []);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      currentUser,
      login,
    }),
    [currentUser, login]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
```

**Splitting contexts for performance:**

```javascript
// Separate contexts for different concerns
const UserContext = createContext(null);
const UserDispatchContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={user}>
      <UserDispatchContext.Provider value={setUser}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
}

// Components only re-render when their context changes
function UserProfile() {
  const user = useContext(UserContext); // Re-renders on user change
  return <div>{user.name}</div>;
}

function UpdateButton() {
  const setUser = useContext(UserDispatchContext); // Never re-renders
  return <button onClick={() => setUser(newUser)}>Update</button>;
}
```

---

## Component Patterns

### Q18: What are common React component patterns?

**Answer:**

**1. Compound Components:**

```javascript
function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ index, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  return (
    <button
      className={activeTab === index ? "active" : ""}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  const { activeTab } = useContext(TabsContext);
  return children[activeTab];
}

// Usage
<Tabs>
  <TabList>
    <Tab index={0}>Tab 1</Tab>
    <Tab index={1}>Tab 2</Tab>
  </TabList>
  <TabPanels>
    <div>Panel 1</div>
    <div>Panel 2</div>
  </TabPanels>
</Tabs>;
```

**2. Render Props:**

```javascript
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  return render({ data, loading });
}

// Usage
<DataFetcher
  url="/api/users"
  render={({ data, loading }) =>
    loading ? <div>Loading...</div> : <UserList users={data} />
  }
/>;
```

**3. Custom Hooks:**

```javascript
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage
function StatusBar() {
  const isOnline = useOnlineStatus();
  return <div>{isOnline ? "✅ Online" : "❌ Offline"}</div>;
}
```

**4. Higher-Order Components (HOC):**

```javascript
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return <Component {...props} user={user} />;
  };
}

// Usage
const ProtectedPage = withAuth(Dashboard);
```

**5. Container/Presentational Pattern:**

```javascript
// Container (logic)
function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return <UserListPresentation users={users} />;
}

// Presentational (UI)
function UserListPresentation({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Q19: How do you handle errors in React?

**Answer:**

**Error Boundaries:**

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>;
```

**With Suspense:**

```javascript
<ErrorBoundary fallback={<div>Failed to load</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <DataComponent promise={fetchData()} />
  </Suspense>
</ErrorBoundary>
```

**Async error handling:**

```javascript
function DataComponent() {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData).catch(setError);
  }, []);

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;

  return <div>{data}</div>;
}
```

### Q20: What are React 19's best practices?

**Answer:**

**1. Use Server Components by default:**

```javascript
// Server Component (default)
async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Only use 'use client' when needed
("use client");
function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**2. Prefer use() over useEffect for data fetching:**

```javascript
// ✅ Good: use() with Suspense
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return <div>{comments}</div>;
}

// ❌ Avoid: useEffect for data fetching
function Comments() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchComments().then(setComments);
  }, []);

  return <div>{comments}</div>;
}
```

**3. Use Actions for mutations:**

```javascript
// ✅ Good: Server Action
"use server";
export async function createPost(formData) {
  await db.posts.create(formData);
}

// Usage
<form action={createPost}>
  <input name="title" />
  <button>Create</button>
</form>;
```

**4. Optimize with useMemo/useCallback only when needed:**

```javascript
// ✅ Good: Memoize expensive computations
const filtered = useMemo(() => {
  return items.filter(expensiveFilter);
}, [items]);

// ❌ Avoid: Unnecessary memoization
const sum = useMemo(() => a + b, [a, b]); // Too simple
```

**5. Keep components small and focused:**

```javascript
// ✅ Good: Single responsibility
function UserProfile({ user }) {
  return (
    <div>
      <UserAvatar user={user} />
      <UserInfo user={user} />
      <UserActions user={user} />
    </div>
  );
}

// ❌ Avoid: God components
function UserProfile({ user }) {
  // 500 lines of code...
}
```

---

## Activity Component & Selective Hydration

### Q21: What is the Activity component and how does it work?

**Answer:**
The `Activity` component is a new React 19 feature that allows you to hide components without unmounting them, preserving their state and enabling selective hydration.

**Basic usage - Preserving state:**

```javascript
import { Activity, useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <>
      <button onClick={() => setActiveTab("home")}>Home</button>
      <button onClick={() => setActiveTab("contact")}>Contact</button>

      <Activity mode={activeTab === "home" ? "visible" : "hidden"}>
        <Home />
      </Activity>
      <Activity mode={activeTab === "contact" ? "visible" : "hidden"}>
        <Contact />
      </Activity>
    </>
  );
}
```

**Selective Hydration without changing UI:**

```javascript
function Page() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <>
      <TabButton onClick={() => setActiveTab("home")}>Home</TabButton>
      <TabButton onClick={() => setActiveTab("video")}>Video</TabButton>

      {/* React hydrates tab buttons first, independently */}
      <Activity mode={activeTab === "home" ? "visible" : "hidden"}>
        <Home />
      </Activity>
      <Activity mode={activeTab === "video" ? "visible" : "hidden"}>
        <Video />
      </Activity>
    </>
  );
}
```

**Managing side effects with Activity:**

```javascript
import { useRef, useLayoutEffect } from "react";

function VideoTab() {
  const ref = useRef();

  useLayoutEffect(() => {
    const videoRef = ref.current;

    // Cleanup when hidden
    return () => {
      videoRef.pause();
    };
  }, []);

  return <video ref={ref} controls src="video.mp4" />;
}
```

**Benefits:**

- Preserves component state when hidden
- Enables selective hydration for better performance
- No need to change initial UI (unlike Suspense)
- Better than conditional rendering for tabs/modals

**When to use:**

- Tab interfaces
- Modals/dialogs
- Sidebars
- Any UI that toggles visibility but should preserve state

### Q22: How does useDeferredValue work with initialValue in React 19?

**Answer:**
React 19 enhances `useDeferredValue` with an `initialValue` option for immediate rendering with a placeholder.

**Without initialValue (React 18):**

```javascript
function Search({ query }) {
  const deferredQuery = useDeferredValue(query);

  // First render shows nothing until query is available
  return <Results query={deferredQuery} />;
}
```

**With initialValue (React 19):**

```javascript
function Search({ query }) {
  // On initial render, value is ''
  // Then a re-render is scheduled with the deferredQuery
  const deferredQuery = useDeferredValue(query, "");

  return <Results query={deferredQuery} />;
}
```

**Complete example:**

```javascript
import { useState, useDeferredValue, Suspense } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query, "");

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      <Suspense fallback={<div>Loading...</div>}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}
```

**Benefits:**

- Immediate initial render
- No flash of empty content
- Better perceived performance
- Smoother user experience

---

## Resource Preloading & Document Metadata

### Q23: How do you use React 19's resource preloading APIs?

**Answer:**
React 19 provides APIs to optimize page loads by preloading resources: `prefetchDNS`, `preconnect`, `preload`, and `preinit`.

**All preloading APIs:**

```javascript
import { prefetchDNS, preconnect, preload, preinit } from "react-dom";

function MyComponent() {
  // Loads and executes script eagerly
  preinit("https://example.com/script.js", { as: "script" });

  // Preloads font
  preload("https://example.com/font.woff", { as: "font" });

  // Preloads stylesheet
  preload("https://example.com/styles.css", { as: "style" });

  // DNS prefetch for future requests
  prefetchDNS("https://api.example.com");

  // Preconnect when you'll request something
  preconnect("https://cdn.example.com");

  return <div>Content</div>;
}
```

**Resulting HTML:**

```html
<html>
  <head>
    <!-- Links/scripts prioritized by utility to early loading -->
    <link rel="prefetch-dns" href="https://api.example.com" />
    <link rel="preconnect" href="https://cdn.example.com" />
    <link rel="preload" as="font" href="https://example.com/font.woff" />
    <link rel="preload" as="style" href="https://example.com/styles.css" />
    <script async src="https://example.com/script.js"></script>
  </head>
  <body>
    ...
  </body>
</html>
```

**When to use each:**

- `preinit()` - Critical scripts that should execute immediately
- `preload()` - Resources needed soon (fonts, stylesheets, images)
- `preconnect()` - Establish connection when you'll request something
- `prefetchDNS()` - DNS lookup when you might request from host

### Q24: How does document metadata work in React 19?

**Answer:**
React 19 automatically hoists metadata tags (`<title>`, `<meta>`, `<link>`) to the document `<head>`.

**Basic metadata:**

```javascript
function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>

      {/* These are automatically hoisted to <head> */}
      <title>{post.title}</title>
      <meta name="author" content="Josh" />
      <link rel="author" href="https://twitter.com/joshcstory/" />
      <meta name="keywords" content={post.keywords} />

      <p>{post.content}</p>
    </article>
  );
}
```

**Stylesheet deduplication:**

```javascript
function ComponentOne() {
  return (
    <div>
      <link rel="stylesheet" href="/styles.css" />
      Content
    </div>
  );
}

function App() {
  return (
    <>
      <ComponentOne />
      <ComponentOne /> {/* Stylesheet only included once */}
      <ComponentOne />
    </>
  );
}
```

**Async scripts with deduplication:**

```javascript
function MyComponent() {
  return (
    <div>
      <script async src="https://example.com/script.js" />
      Hello World
    </div>
  );
}

function App() {
  return (
    <html>
      <body>
        <MyComponent />
        <MyComponent /> {/* Script won't duplicate */}
      </body>
    </html>
  );
}
```

**Benefits:**

- No need for third-party libraries (react-helmet)
- Works with client-only apps, SSR, and Server Components
- Automatic deduplication
- Proper precedence handling

### Q25: What are ref callback cleanup functions in React 19?

**Answer:**
React 19 allows ref callbacks to return cleanup functions that execute when the element is removed.

**Basic cleanup:**

```javascript
<input
  ref={(ref) => {
    // ref created
    console.log("Input mounted:", ref);

    // NEW: return a cleanup function
    return () => {
      // ref cleanup
      console.log("Input unmounted");
    };
  }}
/>
```

**Practical example - Event listeners:**

```javascript
function VideoPlayer() {
  return (
    <video
      ref={(videoElement) => {
        if (!videoElement) return;

        const handlePlay = () => console.log("Playing");
        const handlePause = () => console.log("Paused");

        videoElement.addEventListener("play", handlePlay);
        videoElement.addEventListener("pause", handlePause);

        // Cleanup listeners when unmounted
        return () => {
          videoElement.removeEventListener("play", handlePlay);
          videoElement.removeEventListener("pause", handlePause);
        };
      }}
      src="video.mp4"
      controls
    />
  );
}
```

**TypeScript change required:**

```diff
// ❌ Old: Implicit return rejected
- <div ref={current => (instance = current)} />

// ✅ New: Explicit block statement required
+ <div ref={current => {instance = current}} />
```

**Benefits:**

- Explicit resource cleanup
- No memory leaks
- Better lifecycle management
- Cleaner code

---

## Breaking Changes & Migration

### Q26: What are the major breaking changes in React 19?

**Answer:**

**1. Removed: ReactDOM.render**

```javascript
// ❌ Before (React 18)
import { render } from "react-dom";
render(<App />, document.getElementById("root"));

// ✅ After (React 19)
import { createRoot } from "react-dom/client";
const root = createRoot(document.getElementById("root"));
root.render(<App />);
```

**Codemod:**

```bash
npx codemod@latest react/19/replace-reactdom-render
```

**2. Removed: ReactDOM.hydrate**

```javascript
// ❌ Before
import { hydrate } from "react-dom";
hydrate(<App />, document.getElementById("root"));

// ✅ After
import { hydrateRoot } from "react-dom/client";
hydrateRoot(document.getElementById("root"), <App />);
```

**3. Removed: ReactDOM.unmountComponentAtNode**

```javascript
// ❌ Before
unmountComponentAtNode(container);

// ✅ After
root.unmount();
```

**4. Removed: propTypes and defaultProps for functions**

```javascript
// ❌ Before
function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node,
};

Button.defaultProps = {
  children: "Click me",
};

// ✅ After: Use TypeScript or default parameters
function Button({
  onClick,
  children = "Click me",
}: {
  onClick: () => void,
  children?: React.ReactNode,
}) {
  return <button onClick={onClick}>{children}</button>;
}
```

**5. Removed: String refs**

```javascript
// ❌ Before
class MyComponent extends React.Component {
  componentDidMount() {
    this.refs.input.focus();
  }

  render() {
    return <input ref="input" />;
  }
}

// ✅ After: Use ref callbacks or createRef
class MyComponent extends React.Component {
  inputRef = React.createRef();

  componentDidMount() {
    this.inputRef.current.focus();
  }

  render() {
    return <input ref={this.inputRef} />;
  }
}
```

**6. Removed: Module pattern factories**

```javascript
// ❌ Before
function FactoryComponent() {
  return {
    render() {
      return <div>Hello</div>;
    },
  };
}

// ✅ After: Use regular functions
function Component() {
  return <div>Hello</div>;
}
```

**7. Deprecated: react-test-renderer**

```javascript
// ❌ Deprecated
import renderer from "react-test-renderer";

// ✅ Use modern testing libraries
import { render, screen } from "@testing-library/react";

test("renders button", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});
```

### Q27: How do you migrate to React 19?

**Answer:**

**Step 1: Upgrade to React 18.3 first**

```bash
npm install react@18.3 react-dom@18.3
```

React 18.3 includes warnings for deprecated APIs to help identify issues.

**Step 2: Run all codemods**

```bash
npx codemod@latest react/19/migration-recipe
```

This runs multiple codemods:

- `replace-reactdom-render`
- `replace-string-ref`
- `replace-act-import`
- `replace-use-form-state`
- `prop-types-typescript`

**Step 3: Upgrade to React 19**

```bash
npm install react@19 react-dom@19
```

**Step 4: Update TypeScript types**

```bash
npm install @types/react@19 @types/react-dom@19
```

**Step 5: Fix remaining issues**

Check for:

- Custom code using removed APIs
- Third-party libraries that need updates
- PropTypes usage in function components
- String refs in class components

**Migration checklist:**

✅ Replace `ReactDOM.render` with `createRoot`
✅ Replace `ReactDOM.hydrate` with `hydrateRoot`
✅ Replace string refs with ref callbacks/createRef
✅ Remove propTypes from function components
✅ Use default parameters instead of defaultProps
✅ Update testing to use @testing-library/react
✅ Check third-party library compatibility

### Q28: What are the improved hydration error messages in React 19?

**Answer:**
React 19 provides much better error messages for hydration mismatches.

**React 18 errors (multiple warnings):**

```console
Warning: Text content did not match. Server: "Server" Client: "Client"
  at span
  at App

Warning: An error occurred during hydration. The server HTML was replaced with client content in <div>.

Warning: Text content did not match. Server: "Server" Client: "Client"
  at span
  at App

Uncaught Error: Text content does not match server-rendered HTML.
  at checkForUnmatchedText
  ...
```

**React 19 error (single, detailed message):**

```console
Uncaught Error: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if an SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  <App>
    <span>
+    Client
-    Server

  at throwOnHydrationMismatch
  ...
```

**Benefits:**

- Single consolidated error instead of multiple warnings
- Includes diff showing the mismatch
- Lists common causes
- Link to documentation
- Easier to debug

**Common causes and fixes:**

```javascript
// ❌ Bad: Different on server/client
function Component() {
  return <div>{Date.now()}</div>;
}

// ✅ Good: Use useEffect for client-only values
function Component() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(Date.now());
  }, []);

  return <div>{time ?? "Loading..."}</div>;
}
```

---

## Summary

This comprehensive React 19 interview guide covers **28 detailed questions** on:

✅ **React 19 New Features** - use(), Server Components, Actions, new hooks
✅ **Hooks Fundamentals** - useState, useEffect, best practices
✅ **Advanced Hooks** - useTransition, useOptimistic, useMemo, useCallback, useReducer
✅ **Server Components & Actions** - Server-side rendering, Server Actions
✅ **Suspense & Concurrent** - Suspense boundaries, concurrent rendering
✅ **Performance** - memo, optimization strategies
✅ **Forms** - useActionState, useFormStatus
✅ **Refs & DOM** - useRef, useImperativeHandle, cleanup functions
✅ **Context** - Context API, optimization
✅ **Patterns** - Component patterns, error handling, best practices
✅ **Activity Component** - Selective hydration, state preservation
✅ **Resource Preloading** - prefetchDNS, preconnect, preload, preinit
✅ **Document Metadata** - Automatic hoisting, deduplication
✅ **Breaking Changes** - Migration guide, removed APIs, codemods

All examples are based on **official React 19 documentation** fetched via Context7 MCP! 🎉
