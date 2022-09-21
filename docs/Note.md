# Dev Note


## CLI snippets

``` ts
// query event related to mineId
res = (await Repos.IdleGameSCEventRepo.findAll(realm)).filtered('data.mineId = 91498').toJSON()

// Compute power
Adventure.queryPowers({
  ctx,
  realm,
  farmerPories: [100508, 5387, 6060, 6266],
  supporterPories: [100766, 5131, 5425],
})
```