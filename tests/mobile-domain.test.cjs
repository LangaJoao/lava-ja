const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const output = path.join(__dirname, "../.expo/domain-tests");
fs.mkdirSync(output, { recursive: true });
const source = fs.readFileSync(
  path.join(__dirname, "../src/features/mobile/domain.ts"),
  "utf8",
);
fs.writeFileSync(
  path.join(output, "domain.cjs"),
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
);
const { transitionOrder, redeemPoints } = require(
  path.join(output, "domain.cjs"),
);
const order = {
  id: "test",
  client: "Cliente",
  car: "Toyota",
  serviceId: "complete",
  price: 600,
  time: "10:30",
  date: "Hoje",
  status: "pending",
  channel: "carwash",
  wash: "Brilho",
  mine: true,
  tasks: [false, false, false, false],
  stage: 0,
};
const initial = () => ({
  orders: [{ ...order }],
  points: 1250,
  transactions: [],
  extraField: "preserved",
});
test("reservation passes through acceptance, active job and completion with one points credit", () => {
  let state = initial();
  state = transitionOrder(state, "test", "confirmed");
  assert.equal(state.orders[0].status, "confirmed");
  state = transitionOrder(state, "test", "active");
  assert.equal(
    transitionOrder(state, "test", "completed"),
    state,
    "incomplete checklist cannot finish",
  );
  state = {
    ...state,
    orders: state.orders.map((o) => ({
      ...o,
      tasks: [true, true, true, true],
    })),
  };
  state = transitionOrder(state, "test", "completed");
  assert.equal(state.points, 1310);
  assert.equal(state.orders[0].stage, 4);
  assert.equal(state.transactions.length, 1);
  assert.equal(state.extraField, "preserved");
  assert.equal(
    transitionOrder(state, "test", "completed"),
    state,
    "repeat completion cannot double credit",
  );
});
test("cancelled and rejected bookings cannot start or award points", () => {
  for (const status of ["cancelled", "rejected"]) {
    const state = transitionOrder(initial(), "test", status);
    assert.equal(state.points, 1250);
    assert.equal(transitionOrder(state, "test", "active"), state);
    assert.equal(transitionOrder(state, "test", "completed"), state);
  }
});
test("jobs for other demo customers never credit the current client", () => {
  const state = {
    ...initial(),
    orders: [
      {
        ...order,
        status: "active",
        mine: false,
        tasks: [true, true, true, true],
      },
    ],
  };
  const completed = transitionOrder(state, "test", "completed");
  assert.equal(completed.points, 1250);
  assert.equal(completed.transactions.length, 0);
  assert.equal(completed.orders[0].status, "completed");
});
test("reward redemption records a debit and cannot overdraft or accept invalid costs", () => {
  const redeemed = redeemPoints(initial(), "Lavagem Simples", 500, "reward");
  assert.equal(redeemed.points, 750);
  assert.equal(redeemed.transactions[0].points, -500);
  for (const price of [1000, -5, 0, NaN])
    assert.equal(redeemPoints(redeemed, "Invalid", price, "bad"), redeemed);
});
