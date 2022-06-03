import { close, listenEvents, init } from '@pori-and-friends/pori-actions';
import { ENV } from '@pori-and-friends/pori-metadata';

async function main() {
  console.log('Example: listenEvents');

  const ctx = await init(ENV.Prod);
  const subObj = await listenEvents(ctx);
  subObj
    .on('data', function (eventInfo) {
      const event = eventInfo.event;
      const data = eventInfo.returnValues;
      const { blockNumber, transactionHash } = eventInfo;
      console.log({ blockNumber, transactionHash, event, data });
    })
    .on('changed', function (event) {
      // remove event from local database
      // tx got reverted
    })
    .on('error', function (error, receipt) {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.error('error', error);
    });
}
main();
