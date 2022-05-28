import Realm from 'realm';
import * as Repos from '@pori-and-friends/pori-repositories';
import { IdleGameSc, NftInfo } from '@pori-and-friends/pori-metadata';

export async function transformIdleGameEvent2Database(
  realm: Realm,
  events: Repos.IdleGameSCEventDataModel[],
  resolveNftInfo: (id: string | number) => Promise<NftInfo>,
  onIt?: (it: Realm.BSON.ObjectId) => void
) {
  for (const it of events) {
    switch (it.type) {
      case IdleGameSc.EIdleGameSCEventType.PorianDeposited:
        {
          const data = it.data as IdleGameSc.PorianDepositedData;
          const playerId = data.from;
          const poriId = data.porian;

          let nftInfo: any;

          const poriObj = await Repos.PoriRepo.findOne(realm, poriId);

          // resolve api query only for new nft
          if (!poriObj) nftInfo = await resolveNftInfo(poriId);

          Repos.PlayerRepo.txSync(realm, () => {
            const playerObj = Repos.PlayerRepo.getOrCreate(
              realm,
              playerId,
              Repos.PlayerDataModel.generate(playerId, it.blockNo)
            );

            const poriObj = Repos.PoriRepo.getOrCreate(
              realm,
              poriId,
              nftInfo ? Repos.PoriDataModel.generate(nftInfo) : {}
            );

            // active + add to player inventories
            poriObj.isActive = true;
            const isExists =
              playerObj.pories.findIndex((itm) => itm._id === poriId) >= 0;
            if (!isExists) playerObj.pories.push(poriObj);
          });
        }
        break;

      case IdleGameSc.EIdleGameSCEventType.PorianWithdrawed:
        {
          const data = it.data as IdleGameSc.PorianWithdrawedData;
          const playerId = data.to;
          const poriId = data.porian;

          const playerObj = await Repos.PlayerRepo.findOne(realm, playerId);
          const poriObj = await Repos.PoriRepo.findOne(realm, poriId);

          if (!playerObj) break;

          Repos.PlayerRepo.txSync(realm, () => {
            // deactive + remove from player inventories
            if (poriObj) poriObj.isActive = false;
            const isExists =
              playerObj.pories.findIndex((itm) => itm._id === poriId) >= 0;
            if (isExists) {
              playerObj.pories = playerObj.pories.filter(
                (itm) => itm._id !== poriId
              ) as any;
            }
          });
        }
        break;

      case IdleGameSc.EIdleGameSCEventType.GameDurationChanged:
        {
          const data = it.data as IdleGameSc.GameDurationChangedData;
          const metadata = await Repos.IdleGameSCMetadataRepo.findOne(
            realm,
            'default'
          );

          if (!metadata) break;

          Repos.IdleGameSCMetadataRepo.txSync(realm, () => {
            metadata.extras['turnDuration'] = data.turnDuration;
            metadata.extras['adventureDuration'] = data.adventureDuration;
          });
        }
        break;

      default:
        break;
    }
    onIt && onIt(it._id);
  }
}
