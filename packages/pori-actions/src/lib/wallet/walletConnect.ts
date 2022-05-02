import { Context } from '@pori-and-friends/pori-metadata';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';

class MySessionStorage {
  storageId?: string;
  constructor(storagePath?: string) {
    console.log('MySessionStorage new', storagePath);
    this.storageId = storagePath;
  }
  getSession() {
    if (this.storageId) {
      if (existsSync(this.storageId)) {
        const data = JSON.parse(readFileSync(this.storageId).toString());
        return data;
      }
    }
    return null;
  }
  setSession(session: any) {
    if (this.storageId) writeFileSync(this.storageId, JSON.stringify(session));
    return session;
  }
  removeSession() {
    if (this.storageId) unlinkSync(this.storageId);
  }
}

export async function addWalletConnectToContext(
  ctx: Context,
  sessionStoragePath?: string
) {
  const storage = new MySessionStorage(sessionStoragePath);

  const connector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org', // Required
    qrcodeModal: QRCodeModal,
    session: storage.getSession(),
    clientMeta: {
      description: 'Pori-Poc',
      url: 'https://nodejs.org/en/',
      icons: ['https://nodejs.org/static/images/logo.svg'],
      name: 'Pori-Poc',
    },
  });

  // injected hack b/c in version 1.8.x - typedef is wrong
  (connector as any)._sessionStorage = storage;

  ctx.walletConnectChannel = connector;

  // Check if connection is already established
  if (!connector.connected) {
    // create new session
    connector.createSession({ chainId: 137 });
  }

  // Subscribe to connection events
  connector.on('connect', (error, payload) => {
    if (error) {
      throw error;
    }

    // Get provided accounts and chainId
    const { accounts, chainId } = payload.params[0];
    console.info('wallet connect channel connected', { accounts, chainId });
  });

  connector.on('session_update', (error, payload) => {
    if (error) {
      throw error;
    }

    // Get updated accounts and chainId
    const { accounts, chainId } = payload.params[0];
    console.info('wallet connect channel session updated', {
      accounts,
      chainId,
    });
  });

  connector.on('disconnect', (error, payload) => {
    if (error) {
      throw error;
    }
    console.info('wallet connect channel disconnected', { error, payload });
    // Delete connector
  });
}
