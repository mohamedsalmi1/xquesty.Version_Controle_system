

az login --use-device-code
az acr login --name mainquesty


docker build -t stagequestsite14-05-frontend -f Dockerfile.frontend .
docker tag stagequestsite14-05-frontend mainquesty.azurecr.io/frontend:v1.01
docker push mainquesty.azurecr.io/frontend:v1.01
az webapp restart --resource-group xQuesty --name mainquesty-frontend


docker build -t stagequestsite14-05-backend -f Dockerfile.backend .
docker tag stagequestsite14-05-backend mainquesty.azurecr.io/backend:v1.00
docker push mainquesty.azurecr.io/backend:v1.00
az webapp restart --resource-group xQuesty --name mainquesty-backend

docker build -t stagequestsite14-05-question -f Dockerfile.question .
docker tag stagequestsite14-05-question mainquesty.azurecr.io/question:v1.00
docker push mainquesty.azurecr.io/question:v1.00
az webapp restart --resource-group xQuesty --name mainquesty-question
