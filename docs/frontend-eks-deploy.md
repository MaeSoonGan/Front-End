# Frontend EKS Deploy Guide

## Runtime Assumption

- Frontend host: `https://www.maesoongan.xyz`
- Frontend static routes: `/*`
- Backend API routes: `/api/...`
- ALB listener rules must route `/api/...` to backend services before routing `/` or `/*` to the frontend service.
- Production `VITE_API_BASE_URL` must be empty so the browser calls same-origin `/api/...`.

## Build And Push

Use a unique tag for every deployment, usually a Git SHA or release version.

```text
docker build --build-arg VITE_API_BASE_URL= -t maesoongan-frontend:<TAG> .
aws ecr get-login-password --region <AWS_REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com
docker tag maesoongan-frontend:<TAG> <ECR_REGISTRY>/maesoongan/frontend-user:<TAG>
docker tag maesoongan-frontend:<TAG> <ECR_REGISTRY>/maesoongan/frontend-admin:<TAG>
docker push <ECR_REGISTRY>/maesoongan/frontend-user:<TAG>
docker push <ECR_REGISTRY>/maesoongan/frontend-admin:<TAG>
```

## Kubernetes Apply

Replace `<ECR_USER_IMAGE_URI>:<TAG>` and `<ECR_ADMIN_IMAGE_URI>:<TAG>` in `k8s/frontend-deployment.yaml`, then apply the manifests.

```text
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-ingress.yaml
kubectl rollout status deployment/frontend
```

## Access After Deployment

Users access the service at:

```text
https://www.maesoongan.xyz
```

API requests from the browser should appear as same-origin paths:

```text
https://www.maesoongan.xyz/api/auth/login
https://www.maesoongan.xyz/api/admin/login
https://www.maesoongan.xyz/api/stocks
```

## Update And Redeploy

1. Create or switch to a feature branch.
2. Modify code.
3. Run local verification.
4. Build a new Docker image with a new tag.
5. Push the image to ECR.
6. Update `k8s/frontend-deployment.yaml` image tag.
7. Apply the Deployment and wait for rollout.

```text
npm run dev
npx vite build
docker build --build-arg VITE_API_BASE_URL= -t maesoongan-frontend:<NEW_TAG> .
docker tag maesoongan-frontend:<NEW_TAG> <ECR_REGISTRY>/maesoongan/frontend-user:<NEW_TAG>
docker tag maesoongan-frontend:<NEW_TAG> <ECR_REGISTRY>/maesoongan/frontend-admin:<NEW_TAG>
docker push <ECR_REGISTRY>/maesoongan/frontend-user:<NEW_TAG>
docker push <ECR_REGISTRY>/maesoongan/frontend-admin:<NEW_TAG>
kubectl apply -f k8s/frontend-deployment.yaml
kubectl rollout status deployment/frontend-user
kubectl rollout status deployment/frontend-admin
```

If rollback is needed:

```text
kubectl rollout undo deployment/frontend
```
