echo "Switch gcp config - default"
gcloud config configurations activate personal

echo "Build src"
yarn run nx build examples-simple-tele-bot --prod

echo "Build & Push docker"
docker build . -t gcr.io/weeklyhack-ff068/pori-bot
docker push gcr.io/weeklyhack-ff068/pori-bot

echo "Restore gcp config - default"
gcloud config configurations activate default