#!/bin/bash

echo "Login to Google Cloud"

gcloud auth login

echo "Set project"

gcloud config set project PROJECT_ID

echo "Configure Docker for GCP registry"

gcloud auth configure-docker

echo "Authentication completed"