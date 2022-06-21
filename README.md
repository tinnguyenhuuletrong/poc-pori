

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

# dev
yarn run nx run-many --target=build --all

# prod
yarn run nx run-many --target=build --all --prod
```

distribute js src in `./dist` folder. All code bundle into 1 file. Can easy to dist with
 package.json + target file

```sh

# Run
node dist/packages/examples/scan-idle-game-events/main.js
```

## TODO List

- [x] Query poriant info from nft id -> calculate atk + def
- [-] Integrate telegaram bot -> notify us when
   - [ ] adventure complete 
   - [ ] got atk
- [ ] Allow import private key -> auto start adventure
- [ ] Smarter bot :)) - TBD


## Common query

```ts
  //type='PorianDeposited' && data.from="0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA"
  //type='AdventureStarted' && data.farmer='0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA'
  //data.mineId=1716
  //data.farmer='0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA' || data.helper='0xdF218Bd4414E0B1D581BDdF64498ABBa8cCe0EcA'
  //_id >= oid(6269fd6cdc7151e0d37d09df)
```

## How to run CLI & Telegram bot

1. update env from template

```
source ./.env -> load all env to terminal
```

2. extract snapshot data
 It will restore block scan DB -> avoid scan all events again from blockchain each start 

```txt
 unzip archived/allEvents.prod.realm.zip -> archived/prod 
 in the end we have something like 
 ./archived/repo/prod
  allEvents.prod.realm
```

2. run cli - generate wallet connect credential (optional), secret

``` sh
yarn nx run examples-cli:run
```

```txt
>.help 
.atk                send new mine request
.bot.pull           Bot Update KnowleageDB
.break              Sometimes you get stuck, this gets you out
.clear              Alias for .break
.decData            dec data
.editor             Enter editor mode
.encData            enc data
.exit               Gracefull exit
.gas                calculate gasPrice
.genKey             gen new aes Keypair
.help               Print this help message
.load               Load JS from a file into the REPL session
.market             marketplace
.mine               send new mine request
.price              Kyberswap token price
.save               Save all evaluated commands in this REPL session to a file
.schedule.create    create schedule
.schedule.delete    delete schedule
.schedule.list      List pending schedule
.stats              Show my adv
.storage.download   upload realm data to storage
.storage.upload     upload realm data to storage
.test               test
.wallet.balance     get wallet balance
.wallet.reset       Start walletconnect

Press Ctrl+C to abort current expression, Ctrl+D to exit the REPL
```

``` sh
Run .genKey to generate new secret key ( don't commit or share this )
If success it will generate file 
./archived/repo
  .aesKey

Next you can encrypt your wallet private key with 
.encData <polygon wallet private key>
```

3. Run your telegram bot

yarn nx run examples-simple-tele-bot:run


## How to run CLI bot - Little Rabbit - Porichain

1. update env from template

```sh
export NODE_URI_PROD_HTTP=https://speedy-nodes-nyc.moralis.io/002c069a88c9e6b51c472995/polygon/mainnet
export NODE_URI_PROD_PORICHAIN_HTTP=https://rpc1.porichain.io

export PLAYER_ADDRESS=xxxxx

export DEBUG=pori:*

export NO_HISTORY=1
```

2. extract snapshot data
 It will restore block scan DB -> avoid scan all events again from blockchain each start

```txt
 unzip archived/allEvents.prod.porichain.realm.zip -> archived/prodPoriChain 
 in the end we have something like 
 ./archived/repo/prodPoriChain
  allEvents.prod.realm
```

2. modify src. update formation 
packages/examples/cli/src/app/config.ts

```ts
export const BOT_TIMEOUT_HOURS = 48;
export const BOT_FORMATIONS = [
  {
    minePories: ['3923', '3018', '182'],
    supportPori: 'xxxx', // leave '' for ignore support pharse
    usePortal: true,
  },
  // ...
];
```

3. build

```sh
npm run build:all:prod
```

4. gen secret (one time)

``` sh
node dist/packages/examples/cli/main.js --args="--env,ProdPorichain"

# -----
Run .genKey to generate new secret key ( don't commit or share this )
If success it will generate file 
./archived/repo
  .aesKey

Next you can encrypt your wallet private key with 
.encData <wallet private key>
```

4. run bots

```sh
node dist/packages/examples/cli/main.js --args="--env,ProdPorichain"

.wallet.unlock <encodedData>

.auto.all -> run all bot
.auto.list -> list running bot
```

Note:

- for distribution. it only need folders below
  - dist/packages/examples/cli
  - archived/repo
