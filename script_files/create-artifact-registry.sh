#!/bin/bash

REGION="asia-south1"
REPO="fintech-repo"

echo "Creating Artifact Registry..."

gcloud artifacts repositories create $REPO \
    --repository-format=docker \
    --location=$REGION \
    --description="Fintech Docker Repo"

echo "Registry created"