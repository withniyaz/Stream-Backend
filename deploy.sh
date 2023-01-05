#!/bin/bash

echo "🔥🔥🔥  Starting Deployment  🔥🔥🔥"

cd ~ 

echo "✅ ✅ ✅  SSH Connection Established ✅ ✅ ✅"

ssh ubuntu@34.83.84.81 "pm2 delete --silent streamapp && cd /var/www/ && sudo rm -rf streamapp && sudo git clone --single-branch --branch main https://niyasmhdth:Nyz%401997@gitlab.com/girishprasad.ks/service-book.git streamapp && sudo chmod -R 777 streamapp/ && cd streamapp && npm i && pm2 start --name=streamapp npm -- start -i max"

echo "🚀🚀🚀  Incuse Deployed  🚀🚀🚀 "