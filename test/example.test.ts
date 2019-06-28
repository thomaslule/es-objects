import {
  Entity,
  EventBus,
  FromEventsDecisionProvider,
  InMemoryEventStorage,
  InMemoryKeyValueStorage,
  InMemoryValueStorage,
  PersistedEntityReduceProjection,
  PersistedReduceProjection,
  Store
} from "../src";

test("usage example", async () => {
  // Create an event bus that will store the events before publishing them
  const eventStorage = new InMemoryEventStorage();
  const bus = new EventBus(eventStorage);
  bus.onError(err => {
    // eslint-disable-next-line no-console
    console.error(err);
  });

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
    protected getAggregate() {
      return "cat";
    }
    protected getDecisionReducer() {
      return catFedReducer;
    }
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
  const catDecisionProvider = new FromEventsDecisionProvider(
    "cat",
    catFedReducer,
    eventStorage
  );

  // The store is the object that will create the entities we need
  const catStore = new Store<Cat, boolean>(
    (id, decisionProjection, publish) =>
      new Cat(id, decisionProjection, publish),
    catDecisionProvider,
    event => bus.publish(event)
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
    e => e.aggregate === "cat"
  );
  // Every time an event is published, it will be passed to the projection
  bus.onEvent(event => nbMealsServedProjection.handleEvent(event));

  // This entity projection gives a state for each Cat: is it fed?
  // For the sake of concision I re-use our catFedReducer
  const catFedProjection = new PersistedEntityReduceProjection<boolean>(
    catFedReducer,
    new InMemoryKeyValueStorage(),
    e => e.aggregate === "cat"
  );
  bus.onEvent(event => catFedProjection.handleEvent(event));

  // Let's get a Cat, it has no event yet
  const felix = await catStore.get("felix");
  // Calling this method will lead to publishing a "fed" event
  await felix.feed();

  // We can now query our read projections

  const nbCatsFed = await nbMealsServedProjection.getState();
  expect(nbCatsFed).toBe(1);

  const felixFed = await catFedProjection.getState("felix");
  expect(felixFed).toEqual(true);
});
