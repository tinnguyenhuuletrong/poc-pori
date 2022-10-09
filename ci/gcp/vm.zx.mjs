#!/usr/bin/env zx
const name = 'pori-tele-bot';
const project = 'weeklyhack-ff068';
const zone = 'us-central1-a';
const image = 'gcr.io/weeklyhack-ff068/pori-bot';
const evnFile =
  '/Users/admin/Documents/projects/_research/poriverse/poc-01/ci/gcp/.env/env_ttin.env';

export async function createVm() {
  const args = [
    `--project=${project}`,
    `--zone=${zone}`,
    `--container-image=${image}`,
    `--container-env-file=${evnFile}`,
    '--machine-type=e2-micro',
    '--network-interface=network-tier=PREMIUM,subnet=default',
    '--maintenance-policy=MIGRATE',
    '--provisioning-model=STANDARD',
    '--image=projects/cos-cloud/global/images/cos-stable-101-17162-40-5',
    '--boot-disk-size=10GB',
    '--boot-disk-type=pd-standard',
    `--boot-disk-device-name=${name}`,
    '--container-restart-policy=always',
    '--container-privileged',
    '--no-shielded-secure-boot',
    '--shielded-vtpm',
    '--shielded-integrity-monitoring',
    '--labels=container-vm=cos-stable-101-17162-40-5',
  ];

  await $`gcloud compute instances create-with-container ${name} ${args}`;
}

export async function updateVm() {
  const args = [
    `--project=${project}`,
    `--zone=${zone}`,
    `--container-image=${image}`,
  ];
  await $`gcloud compute instances update-container ${name} ${args}`;
}

export async function deleteVm() {
  const args = [`--project=${project}`, `--zone=${zone}`];
  await $`gcloud compute instances delete ${name} ${args}`;
}

export async function restartVm() {
  const args = [`--project=${project}`, `--zone=${zone}`];
  await $`gcloud compute instances stop ${name} ${args}`;
  await $`gcloud compute instances start ${name} ${args}`;
}

const cmd = argv._[0];
const ALL_CMDS = ['createVm', 'deleteVm', 'restartVm', 'updateVm'];
switch (cmd) {
  case 'createVm':
    await createVm();
    break;
  case 'deleteVm':
    await deleteVm();
    break;
  case 'restartVm':
    await restartVm();
    break;
  case 'updateVm':
    await updateVm();
    break;

  default:
    echo(`Unknown command. Supported Cmd: \n-${ALL_CMDS.join('\n-')}`);
    break;
}
