const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const out = path.join(__dirname, "../.expo/platform-tests");
fs.mkdirSync(out, { recursive: true });
for (const file of ["data", "finance", "otp", "domain"]) {
  const source = fs.readFileSync(
    path.join(__dirname, `../src/features/mobile/${file}.ts`),
    "utf8",
  );
  fs.writeFileSync(
    path.join(out, `${file}.js`),
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  );
}
const { normalizePhone, issueDemoOtp, checkDemoOtp } = require(
  path.join(out, "otp.js"),
);
const {
  splitAmount,
  reportFor,
  periodRange,
  inRange,
  settlementCandidates,
  ratingFor,
} = require(path.join(out, "finance.js"));
const { submitReview } = require(path.join(out, "domain.js"));
const base = {
  id: "o1",
  client: "Cliente",
  car: "Toyota",
  serviceId: "complete",
  price: 600,
  date: "Hoje",
  time: "10:00",
  status: "completed",
  channel: "carwash",
  partnerId: "brilho",
  wash: "Brilho",
  completedAt: "2026-10-20T10:00:00+02:00",
  confirmedAt: "2026-10-20T09:00:00+02:00",
  createdAt: "2026-10-19T09:00:00+02:00",
  tasks: [true, true, true, true],
  stage: 4,
  mine: true,
};
test("OTP normalizes Mozambique numbers and refuses invalid numbers", () => {
  assert.equal(normalizePhone("84 123 4567"), "+258841234567");
  assert.equal(normalizePhone("+258 84 123 4567"), "+258841234567");
  for (const input of ["not-a-phone", "+27841234567", "84123", "811234567"])
    assert.equal(normalizePhone(input), null);
});
test("OTP works identically for every role, expires and cannot be reused", () => {
  for (const role of ["client", "carwash", "provider"]) {
    const challenge = issueDemoOtp("+258841234567", role, 1000);
    assert.equal(challenge.verified, false);
    assert.ok(checkDemoOtp(challenge, "000000", 1001).error);
    const result = checkDemoOtp(challenge, "123456", 1001);
    assert.equal(result.error, "");
    assert.equal(result.challenge.role, role);
    assert.ok(checkDemoOtp(result.challenge, "123456", 1002).error);
    assert.ok(checkDemoOtp(challenge, "123456", 181000).error);
  }
});
test("OTP stops validation after five incorrect attempts", () => {
  let challenge = issueDemoOtp("+258841234567", "client", 0);
  for (let i = 0; i < 5; i++)
    challenge = checkDemoOtp(challenge, "000000", 1).challenge;
  const result = checkDemoOtp(challenge, "123456", 2);
  assert.ok(result.error);
  assert.equal(result.challenge.verified, false);
});
test("commission splits preserve every cent for 10% and 5%", () => {
  assert.deepEqual(splitAmount(600, 1000), {
    grossCents: 60000,
    feeCents: 6000,
    netCents: 54000,
  });
  assert.deepEqual(splitAmount(600, 500), {
    grossCents: 60000,
    feeCents: 3000,
    netCents: 57000,
  });
  const split = splitAmount(99.99, 500);
  assert.equal(split.netCents + split.feeCents, split.grossCents);
});
test("reports recognize provider vacancies on acceptance and car washes on completion", () => {
  const provider = {
    ...base,
    id: "p1",
    channel: "provider",
    partnerId: "p",
    status: "confirmed",
    completedAt: undefined,
  };
  const pending = { ...base, id: "pending", status: "pending" };
  const cancelled = { ...base, id: "cancelled", status: "cancelled" };
  const report = reportFor(
    [base, provider, pending, cancelled],
    "2026-10-20",
    "2026-10-20",
  );
  assert.deepEqual(report, {
    count: 2,
    grossCents: 120000,
    feeCents: 9000,
    netCents: 111000,
  });
  assert.equal(
    reportFor([base, provider], "2026-10-20", "2026-10-20", "p").feeCents,
    3000,
  );
  assert.equal(
    reportFor([{ ...base, status: "confirmed" }], "2026-10-20", "2026-10-20")
      .count,
    0,
  );
});
test("calendar periods respect Maputo, week boundaries and leap-year months", () => {
  assert.deepEqual(periodRange("week", "2026-10-25"), {
    start: "2026-10-19",
    end: "2026-10-25",
  });
  assert.deepEqual(periodRange("month", "2028-02-15"), {
    start: "2028-02-01",
    end: "2028-02-29",
  });
  assert.equal(
    inRange("2026-10-19T23:00:00Z", "2026-10-20", "2026-10-20"),
    true,
  );
});
test("weekly settlement excludes open weeks, cash, other pillars and already settled orders", () => {
  const old = { ...base, id: "old", completedAt: "2026-10-17T10:00:00+02:00" };
  const cash = { ...old, id: "cash", payment: "Pagar no Local" };
  const provider = { ...old, id: "provider", channel: "provider" };
  assert.deepEqual(
    settlementCandidates(
      [old, base, cash, provider],
      [],
      "brilho",
      "2026-10-19",
    ).map((o) => o.id),
    ["old"],
  );
  assert.equal(
    settlementCandidates([old], [{ orderIds: ["old"] }], "brilho", "2026-10-19")
      .length,
    0,
  );
});
test("reviews require customer confirmation, valid stars, completion and ownership; duplicates are immutable", () => {
  assert.equal(submitReview(base, 5, "Óptimo", "now"), base);
  const confirmed = { ...base, clientConfirmedAt: "2026-10-20T11:00:00+02:00" };
  const reviewed = submitReview(
    confirmed,
    5,
    " Óptimo ",
    "2026-10-20T11:01:00+02:00",
  );
  assert.equal(reviewed.review.comment, "Óptimo");
  assert.equal(submitReview(reviewed, 1, "Alterar", "later"), reviewed);
  for (const stars of [0, 6, 1.5])
    assert.equal(submitReview(confirmed, stars, "", "now"), confirmed);
  const other = { ...confirmed, mine: false };
  assert.equal(submitReview(other, 5, "", "now"), other);
  const active = { ...confirmed, status: "active" };
  assert.equal(submitReview(active, 5, "", "now"), active);
  assert.deepEqual(ratingFor([reviewed], "brilho"), { count: 1, average: 5 });
});
