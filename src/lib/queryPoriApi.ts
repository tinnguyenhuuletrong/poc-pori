import { getAPILink } from "../info";
import { ENV, NftInfo } from "../type";
import axiosIns from "../utils/axiosHelper";

export async function queryNftInfo(
  id: string | number,
  ctx: {
    env: ENV;
  } = {
    env: ENV.Staging,
  }
): Promise<NftInfo> {
  const baseURL = getAPILink(ctx.env);

  const res = await axiosIns.request({
    method: "get",
    baseURL,
    url: `/api/v1/assets/${id}`,
  });
  if (res.status !== 200)
    throw new Error(`Request failed status ${res.status} - ${res.data}`);

  return JSON.parse(res.data);
}
