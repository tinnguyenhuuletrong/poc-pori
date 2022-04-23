

# PoriAndFriends

This project was generated using [Nx](https://nx.dev).

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></p>

🔎 **Smart, Fast and Extensible Build System**

## Instalations

Node 14+
npm install
copy `.env.template` -> `.env` and fill content

## Acronym

- SC: Smart Contract
- BlockChainHead: Top block number at runtime

## Generate a library

App modules / package. Should contain unit test it self

``` sh
yarn run nx generate @nrwl/js:library --name=utils
```

## Examples

Small app. Usefull for demo / debug a small function or modules to team

All Example should locate in `packages/examples`. Generate using cmd below

``` sh
yarn run nx generate @nrwl/node:app --directory examples --name <exampleName>
```

Run Example using cmd below

``` sh
yarn run nx run examples-<name>:run
```

## Examples list

Locate in packages/examples

- examples-parse-nft: Parse nft info using pori api
- examples-query-mine-info : Query mine info from SC
- examples-simple-tele-bot: Simple Telegram bot
- examples-stream-idle-game-events: Stream all idle game SC event from BlockChainHead -> log to console
- examples-scan-idle-game-events: Scan all events of idle game SC -> save to json file
  - Please extract json file inside `archived/allEvents.stag.json.zip` to folder `archived` before run ( if not. it will scan all events from start - 💤💤💤 )

## Build & Distribute

```sh
# better to test before build :p
yarn run nx test


yarn run nx build
```

distribute js src in `./dist` folder

## TODO List

- [x] Query poriant info from nft id -> calculate atk + def
- [-] Integrate telegaram bot -> notify us when
   - [ ] adventure complete 
   - [ ] got atk
- [ ] Allow import private key -> auto start adventure
- [ ] Smarter bot :)) - TBD