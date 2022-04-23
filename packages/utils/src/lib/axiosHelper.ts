import { Axios } from 'axios';

const axiosIns = new Axios({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
  },
});

// Todo add log

export { axiosIns };
