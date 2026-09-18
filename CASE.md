# Evidence supplied by the client

This is a fictional case. The artifacts below describe the inherited platform. The small local API is a separate exercise fixture: it does not reproduce this platform's flakiness, topology, or performance limits.

## Artifact A — unreliable UI test

The team reports that this test fails about once in six runs. No root cause has been confirmed. Other tests and users share the account and environment.

```text
test("customer can submit a renewal") {
  login("renewal.user@example.com", "example-password")
  navigateTo("/policies")
  sleep(3000)
  click(firstRow().button("Renew"))
  setField("effective_date", today() + 30.days)
  setField("payment_method", "card_on_file")
  click("Submit")
  sleep(2000)
  assert(pageContains("Renewal"))
  rows = db.query("SELECT * FROM renewals ORDER BY id DESC")
  assert(rows[0].status == "PENDING")
}
```

## Artifact B — initial performance result

| Step | Virtual users | Throughput | p50 | p99 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 200 | 310 rps | 120 ms | 310 ms | 0.00% |
| 2 | 400 | 620 rps | 125 ms | 480 ms | 0.00% |
| 3 | 600 | 890 rps | 130 ms | 1,900 ms | 0.02% |
| 4 | 800 | 905 rps | 134 ms | 6,400 ms | 0.31% |
| 5 | 1,000 | 900 rps | 131 ms | 11,200 ms | 0.44% |

The test lasted 12 minutes including a three-minute ramp, exercising only `POST /renewals`. Errors were HTTP 504s. There were two application instances and one database; the team describes the environment as “one quarter of production.” The database held 10,000 policies. Application CPU peaked at 45%; database CPU at 38%. A monitored database connection pool had a limit of 100 and was fully occupied from step 3 onward. The payment gateway was stubbed.

The team's conclusion: **“Sustained 900 requests per second with a 0.44% error rate. Ready for a 10× spike.”**

Actual production traffic shape, dataset size, gateway limits, service objectives, and pool-wait/query/lock telemetry have not been supplied. The scope of the reported pool metric is also unknown.

## Planning constraints

- For planning, assume you have one engineer for roughly half their time and a nominated contact in each squad. Additional hiring and a production-sized test environment are not approved.
- Propose outcomes and targets; label assumptions. You are not expected to invent missing production facts or promise numerical improvements without a baseline.
- Keep the offering to an initial engagement another consultant could repeat. A full business plan, pricing model, or sales deck is outside this exercise.
