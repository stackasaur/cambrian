import { expect, test } from "vitest";
import { expression } from "./expression";
import { Reactive } from ".";

test('adds 1 and 5', () => {
    const result = expression`1 + ${4}`.get();
    expect(result).toBe(5);
});

test('Reactive parameters', () => {
    const arg0 = Reactive(1);
    const arg1 = Reactive(1);
    const result = expression`${arg0} + ${arg1}`;

    const r0 = result.get();

    arg0.set(2);
    const r1 = result.get();

    arg1.set(2);
    const r2 = result.get();

    expect(r0).toBe(2);
    expect(r1).toBe(3);
    expect(r2).toBe(4);
});