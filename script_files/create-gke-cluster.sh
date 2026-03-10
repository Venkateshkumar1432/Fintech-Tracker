#!/bin/bash

PROJECT_ID="your-project-id"
CLUSTER_NAME="fintech-cluster"
REGION="asia-south1"

echo "Creating GKE cluster..."

gcloud container clusters create $CLUSTER_NAME \
  --region $REGION \
  --num-nodes 3 \
  --machine-type e2-standard-2 \
  --enable-autorepair \
  --enable-autoupgrade

echo "Getting cluster credentials..."

gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION

kubectl get nodes

echo "Cluster ready"