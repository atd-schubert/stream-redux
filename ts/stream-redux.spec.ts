import { expect } from "chai";

import { Action, StreamRedux } from "./";

// official example from npm package redux
function counter(state: number = 0, action: Action) {
    switch (action.type) {
        case "INCREMENT":
            return state + 1;
        case "DECREMENT":
            return state - 1;
        default:
            return state;
    }
}

function otherCounter(state: number = 0, action: Action) {
    switch (action.type) {
        case "INCREMENT":
            return state + 1;
        case "SQUARE":
            return state * state;
        case "ROOT":
            return Math.sqrt(state);
        default:
            return state;
    }
}

describe("StreamRedux", () => {
    describe("Instantiate", () => {
        it("It should create an instance of a stream", () => {
            expect(new StreamRedux<number, Action>(counter)).to.be.an.instanceof(StreamRedux);
        });
    });
    describe("Using as known from Redux", () => {
        let stream: StreamRedux<number, Action>;
        beforeEach(() => {
            stream = new StreamRedux<number, Action>(counter);
        });
        it("should modify state with .dispatch", () => {
            stream.dispatch({type: "INCREMENT"});
            expect(stream.getState()).to.equal(1);
        });
        it("should modify state with .dispatch multiple times", () => {
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "DECREMENT"});
            stream.dispatch({type: "INCREMENT"});
            expect(stream.getState()).to.equal(2);
        });
        it("should replace the reducer with .replaceReducer", () => {
            stream = new StreamRedux<number, Action>(otherCounter);
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "SQUARE"});
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "ROOT"});
            stream.replaceReducer(counter);
            stream.dispatch({type: "DECREMENT"});
            expect(stream.getState()).to.equal(2);
        });
    });
    describe("Using as a stream", () => {
        let stream: StreamRedux<number, Action>;
        beforeEach(() => {
            stream = new StreamRedux<number, Action>(counter);
        });
        it("should modify state with .write", () => {
            stream.write({type: "INCREMENT"});
            stream.write({type: "INCREMENT"});
            stream.write({type: "DECREMENT"});
            stream.write({type: "INCREMENT"});
            expect(stream.getState()).to.equal(2);
        });
        it("should stream the state while using .dispatch", (done: MochaDone) => {
            const results = [0, 1, 2, 1, 2]; // 0 => initial state!!!

            stream.on("data", (chunk) => expect(chunk).to.equal(results.shift()));
            stream.on("end", () => {
                /* istanbul ignore if */
                if (results.length) {
                    return done(new Error("There are steps missing"));
                }
                return done();
            });

            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "INCREMENT"});
            stream.dispatch({type: "DECREMENT"});
            stream.dispatch({type: "INCREMENT"});
            stream.end();
        });
        it("should stream the state while using .write", (done: MochaDone) => {
            const results = [0, 1, 2, 1, 2]; // 0 => initial state!!!

            stream.on("data", (chunk) => expect(chunk).to.equal(results.shift()));
            stream.on("end", () => {
                /* istanbul ignore if */
                if (results.length) {
                    return done(new Error("There are steps missing"));
                }
                return done();
            });

            stream.write({type: "INCREMENT"});
            stream.write({type: "INCREMENT"});
            stream.write({type: "DECREMENT"});
            stream.write({type: "INCREMENT"});
            stream.end();
        });
        it("should emit changes on .write with .subscribe", (done: MochaDone) => {
            let called = false;
            let calledAgain = false;

            const unsubscribe = stream.subscribe(() => {
                /* istanbul ignore if */
                if (calledAgain) {
                    done(new Error("Called event after unsubscribe"));
                }
                if (called) {
                    unsubscribe();
                    calledAgain = true;
                    done();
                }
                called = true;
            });

            stream.write({type: "INCREMENT"});
            stream.write({type: "INCREMENT"});
            stream.write({type: "DECREMENT"});
            stream.write({type: "INCREMENT"});
        });
    });
});
