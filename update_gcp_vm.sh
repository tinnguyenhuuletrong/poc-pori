echo "Switch gcp config - default"
gcloud config configurations activate personal

echo "Update VM container image"
zx ./ci/gcp/vm.zx.mjs updateVm

echo "Restore gcp config - default"
gcloud config configurations activate default