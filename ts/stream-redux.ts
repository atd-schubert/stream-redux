import { Action, createStore, Reducer, Store, StoreEnhancer, Unsubscribe } from "redux";
import { Duplex } from "stream";

export class StreamRedux<S, A extends Action> extends Duplex /* implements Store<S> */ {
    protected store: Store<S>;

    private lastNext?: (err?: Error) => void;

    constructor(reducer: Reducer<S>, enhancer?: StoreEnhancer<S>) {
        super({objectMode: true});
        this.store = createStore(reducer, enhancer);
        this.push(this.store.getState());
        this.store.subscribe(() => {
            this.push(this.store.getState());
            if (this.lastNext) {
                const next = this.lastNext;
                this.lastNext = undefined;
                next();
            }
        });
        this.on("finish", () => this.push(null));
    }

    // Pass though to fulfill the Store interface
    public dispatch(action: A): A {
        return this.store.dispatch(action);
    }
    public getState(): S {
        return this.store.getState();
    }
    public subscribe(listener: () => void): Unsubscribe {
        return this.store.subscribe(listener);
    }
    public replaceReducer(nextReducer: Reducer<S>): void {
        return this.store.replaceReducer(nextReducer);
    }

    // Implementation of the abstract stream methods
    public _write(chunk: A, encoding: string, next: (err?: Error) => void) {
        this.lastNext = next;
        this.store.dispatch(chunk);
    }
    public _read() {
        return;
    }
}
