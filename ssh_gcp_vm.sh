echo "Switch gcp config - default"
gcloud config configurations activate personal

echo "SSH VM container image"
gcloud compute ssh --zone "us-central1-a" "pori-tele-bot"  --project "weeklyhack-ff068"

echo "Restore gcp config - default"
gcloud config configurations activate default