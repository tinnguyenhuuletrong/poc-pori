import fs from "fs";
import { close, scanEvents, init } from "..";
import { ENV } from "../type";

type SCStructure = {
  _metadata: {
    createdBlock: number;
    head: number | null;
  };
  events: any[];
};

function readSnapshotData(path): SCStructure {
  if (!fs.existsSync(path)) {
    return {
      _metadata: {
        createdBlock: 25777543,
        head: null,
      },
      events: [],
    };
  }
  const data = JSON.parse(fs.readFileSync(path).toString());
  return data;
}

function saveSnapshot(path, data: SCStructure) {
  console.log("saved");
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

async function main() {
  console.log("Example: scanEvents");

  const ctx = await init(ENV.Staging);
  console.log("connected");

  // Staging Contract create on 25777543
  const path = "./archived/allEvents.stag.json";
  const scData = readSnapshotData(path);
  let from = scData._metadata.head || scData._metadata.createdBlock;
  let saveInterval = 0;

  const batchSize = 500;
  const headBlock = await ctx.web3.eth.getBlockNumber();
  console.log("top block", headBlock);

  while (from < headBlock) {
    const to = from + batchSize;
    console.log("scan from ", { from, to: from + batchSize });
    const events = await scanEvents(ctx, {
      filter: "allEvents",
      fromBlock: from,
      toBlock: to,
    });

    from = to;
    scData._metadata.head = to;
    scData.events = scData.events.concat(events);
    saveInterval++;
    if (saveInterval % 10 === 0) {
      saveSnapshot(path, scData);
      saveInterval = 0;
    }
  }
  saveSnapshot(path, scData);

  await close(ctx);
}
main();
