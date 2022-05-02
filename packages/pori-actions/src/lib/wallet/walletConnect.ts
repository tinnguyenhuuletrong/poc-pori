import { Context } from '@pori-and-friends/pori-metadata';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

export async function addWalletConnectToContext(ctx: Context) {
  const connector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org', // Required
    qrcodeModal: QRCodeModal,
    clientMeta: {
      description: 'Pori-Poc',
      url: 'https://nodejs.org/en/',
      icons: ['https://nodejs.org/static/images/logo.svg'],
      name: 'Pori-Poc',
    },
  });
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
    console.log('wallet connect channel connected', { accounts, chainId });
  });

  connector.on('session_update', (error, payload) => {
    if (error) {
      throw error;
    }

    // Get updated accounts and chainId
    const { accounts, chainId } = payload.params[0];
    console.log('wallet connect channel session updated', {
      accounts,
      chainId,
    });
  });

  connector.on('disconnect', (error, payload) => {
    if (error) {
      throw error;
    }

    // Delete connector
  });
}
