# es-objects

A collection of objects to help you build an event-sourced architecture.

## What does it look like?

Here is an example in typescript:

```typescript
// Create an event bus that will store the events before publishing them
const eventStorage = new InMemoryEventStorage();
const bus = new EventBus(eventStorage);
bus.onError((err) => { console.error(err); });

// Create an entity class, this is where the business logic goes.
class Cat extends Entity<boolean> {
  constructor(id, decisionSequence, publish) {
    super(id, decisionSequence, publish);
  }

  // Based on the current state of the entity (the decision projection) and the called methods and arguments
  // the business logic decides which events to publish
  public async feed() {
    if (this.getDecision()) {
      throw new Error("cat already fed!");
    }
    await this.publishAndApply({ type: "fed" });
  }

  // Those methods are needed by the Entity class
  protected getAggregate() { return "cat"; }
  protected getDecisionReducer() { return catFedReducer; }
}

// This is the reducer that creates a decision projection from a stream of events
// The decision projection should only carry the information we need to take decisions
function catFedReducer(state = false, event) {
  if (event.type === "fed") {
    return true;
  }
  return state;
}

// The store needs an object that provides the decision projection, this one builds it from the published events
const catDecisionProvider = new FromEventsDecisionProvider("cat", catFedReducer, eventStorage);

// The store is the object that will create the entities we need
const catStore = new Store<Cat, boolean>(
  (id, decisionProjection, publish) => new Cat(id, decisionProjection, publish),
  catDecisionProvider,
  (event) => bus.publish(event),
);

// Now everything is set up on the write side, lets add projections to query our events

// This global projection listen to all "cat" events and count the meals served
// It needs a reducer to transform the events into a state:
function nbMealsReducer(state = 0, event) {
  if (event.type === "fed") {
    return state + 1;
  }
  return state;
}
// It will be persisted in a storage
const nbMealsServedProjection = new PersistedReduceProjection<number>(
  nbMealsReducer,
  new InMemoryValueStorage(),
  (e) => e.aggregate === "cat",
);
// Every time an event is published, it will be passed to the projection
bus.onEvent((event) => nbMealsServedProjection.handleEvent(event));

// This entity projection gives a state for each Cat: is it fed?
// For the sake of concision I re-use our catFedReducer
const catFedProjection = new PersistedEntityReduceProjection<boolean>(
  catFedReducer,
  new InMemoryKeyValueStorage(),
  (e) => e.aggregate === "cat",
);
bus.onEvent((event) => catFedProjection.handleEvent(event));

// Let's get a Cat, it has no event yet
const felix = await catStore.get("felix");
// Calling this method will lead to publishing a "fed" event
await felix.feed();

// We can now query our read projections

const nbCatsFed = await nbMealsServedProjection.getState();
expect(nbCatsFed).toBe(1);

const felixFed = await catFedProjection.getState("felix");
expect(felixFed).toEqual(true);
```

## Objects

### Events

Events are plain javascript objects, they have 3 mandatory properties:

- `aggregate`
- `id` (the id of the specific entity that emitted the event)
- `sequence` (for each entity, events are sequentially numbered)

And as much custom properties that you need to describe what happened.

### EventBus

```typescript
const bus = new EventBus(new InMemoryEventStorage());
bus.onError((err) => { console.error(err); });
bus.onEvent((event) => { console.log(`Something happened: ${event}`); });
bus.publish({ aggregate: 'cat', id: 'felix', sequence: 0, type: 'fed' });
```

#### constructor(EventStorage)

Instanciate the bus with an underlying `EventStorage`.

#### async publish(Event)

When you `publish` an event, it is first stored in the EventStorage then it is emitted to every subscribers.

#### onEvent(handler)

The handler is called for every published event.

If the handler throws or returns a rejecting promise, an `error` will be emitted.

#### onError(handler)

Listen to `error`. You really should write at least one error handler because `EventBus` is an instance of `EventEmitter`, if it emits an `error` while no listener is attached, it throws.

### Entity

```typescript
class Cat extends Entity<boolean> {
  constructor(id, decisionSequence, publish) {
    super(id, decisionSequence, publish);
  }
  public async pet() { await this.publishAndApply({ type: "pet" }); }
  protected getAggregate() { return "cat"; }
  protected getDecisionReducer() { return catFedReducer; }
}
```

When writing entity classes, you can inherit from this class to write less code.

#### constructor(id, decisionSequence, publish)

The constructor has the same arguments that the `Store` provides to create an entity:

- the id of the entity
- the current DecisionSequence (decision projection + sequence of last event)
- the publish method to call when the entity wants to emit an event

#### getDecision(): TDecision

Get the current decision state.

#### async publishAndApply(eventData)

Call this method with only the custom event fields, it will set for you the mandatory fields, emit the event and apply it to itself to update its decision projection.

### Store

```typescript
const catStore = new Store<Cat, boolean>(
  (id, decisionProjection, publish) => new Cat(id, decisionProjection, publish),
  catDecisionProvider,
  (event) => bus.publish(event),
);
const felix = await catStore.get("felix");
```

The object that you need to create your entities from the underlying storage.

#### constructor(createEntity, decisionProvider, publishEvent)

- createEntity is a function that the store will call each time you request an entity. It provides 3 args: 
  * the id of the entity
  * the current DecisionSequence (decision projection + sequence of last event)
  * the publish method to call when the entity wants to emit an event
  * => With those 3 arguments, you have to return an entity instance.
- An object implementing `DecisionProvider` to get the decision state for an entity
- The publish method that will be passed to the entities.

#### get(id: string)

Get an entity initialized with its decision projection and ready to emit events.
