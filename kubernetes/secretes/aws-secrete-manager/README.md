# AWS Secrets Manager Integration with EKS using External Secrets Operator (IRSA)

# Project Overview

This document explains how to securely integrate **AWS Secrets Manager** with an **Amazon EKS Cluster** using the **External Secrets Operator (ESO)** and **IAM Roles for Service Accounts (IRSA)**.

The goal is to eliminate hardcoded credentials and manually created Kubernetes Secrets.

---

# Why do we need AWS Secrets Manager?

Initially, the application stored database credentials inside Kubernetes Secrets.

Example:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret

data:
  DB_USER: xxxx
  DB_PASSWORD: xxxx
```

Although Kubernetes Secrets are Base64 encoded, they are **NOT encrypted by default**.

Problems with Kubernetes Secrets:

* Stored inside Kubernetes etcd.
* Can accidentally be committed to GitHub.
* Credentials need manual updates.
* Password rotation becomes difficult.
* Difficult to manage across multiple environments.

Instead, AWS provides **Secrets Manager**, a centralized and secure secret management service.

---

# Why AWS Secrets Manager?

AWS Secrets Manager provides:

* Encryption using AWS KMS
* Automatic Secret Rotation
* IAM-based Access Control
* Auditing through CloudTrail
* Centralized Secret Management
* Secure access without storing AWS credentials inside Kubernetes

---

# Final Architecture

```
                    AWS Secrets Manager
                            │
                            │
                            ▼
                     IAM Role (IRSA)
                            │
                            ▼
                External Secrets Operator
                            │
                            ▼
                  ClusterSecretStore
                            │
                            ▼
                    ExternalSecret
                            │
                            ▼
                Kubernetes Secret
                    (backend-secret)
                            │
                            ▼
                    Backend Deployment
                            │
                            ▼
                            RDS
```

---

# Step 1 : Verify OIDC Provider

Before configuring IRSA, verify that your EKS cluster has an OIDC Provider.

Cluster Name:

```
navyojana
```

Command:

```bash
aws eks describe-cluster \
--name navyojana \
--region us-east-2 \
--query "cluster.identity.oidc.issuer" \
--output text
```

Output:

```
https://oidc.eks.us-east-2.amazonaws.com/id/XXXXXXXX
```

### Why?

IRSA depends on the OIDC provider.

Without OIDC:

* IAM Roles cannot be assumed by Kubernetes Pods.

---

# Step 2 : Install External Secrets Operator

Add Helm Repository

```bash
helm repo add external-secrets https://charts.external-secrets.io
```

Update Helm Repository

```bash
helm repo update
```

Install External Secrets

```bash
helm install external-secrets external-secrets/external-secrets \
--namespace external-secrets \
--create-namespace
```

Verify Installation

```bash
kubectl get pods -n external-secrets
```

Expected Output

```
external-secrets
external-secrets-cert-controller
external-secrets-webhook
```

### Why?

The External Secrets Operator watches Kubernetes resources and synchronizes secrets from AWS Secrets Manager.

---

# Step 3 : Create IAM Policy

Create Policy File

```bash
vim external-secrets-policy.json
```

Policy

```json
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Effect":"Allow",
      "Action":[
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecrets"
      ],
      "Resource":"*"
    }
  ]
}
```

Create Policy

```bash
aws iam create-policy \
--policy-name ExternalSecretsPolicy \
--policy-document file://external-secrets-policy.json
```

### Why?

Following the Principle of Least Privilege.

Instead of AdministratorAccess, the operator only gets permission to read secrets.

---

# Step 4 : Configure IRSA

Create IAM Service Account

```bash
eksctl create iamserviceaccount \
--cluster navyojana \
--namespace external-secrets \
--name external-secrets \
--attach-policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/ExternalSecretsPolicy \
--approve \
--override-existing-serviceaccounts \
--region us-east-2
```

Verify

```bash
kubectl describe sa external-secrets -n external-secrets
```

Expected

```
eks.amazonaws.com/role-arn:
arn:aws:iam::<ACCOUNT_ID>:role/....
```

### Why?

Instead of storing AWS Access Keys inside Kubernetes:

```
AWS Access Key
AWS Secret Key
```

the Pod automatically receives temporary AWS credentials.

This is the production standard.

---

# Step 5 : Create Secret in AWS Secrets Manager

Navigate to

```
AWS Console

↓

Secrets Manager

↓

Store a new Secret
```

Secret Type

```
Other Type of Secret
```

Key-Value

```
DB_USER

DB_PASSWORD
```

Secret Name

```
navyojana/backend
```

### Why?

AWS Secrets Manager becomes the single source of truth.

---

# Step 6 : Create ClusterSecretStore

Create

```
secret-store.yaml
```

```yaml
apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: aws-secret-store

spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-2

      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets
            namespace: external-secrets
```

Apply

```bash
kubectl apply -f secret-store.yaml
```

Verify

```bash
kubectl get clustersecretstore
```

Expected

```
READY=True
```

### Why ClusterSecretStore?

ClusterSecretStore can be reused by multiple namespaces.

```
dev

qa

uat

prod
```

All can access the same AWS Secrets Manager configuration.

---

# Step 7 : Create ExternalSecret

Create

```
external-secret.yaml
```

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret

metadata:
  name: backend-secret
  namespace: navyojana

spec:

  refreshInterval: 1h

  secretStoreRef:
    name: aws-secret-store
    kind: ClusterSecretStore

  target:
    name: backend-secret
    creationPolicy: Owner

  data:

  - secretKey: DB_USER
    remoteRef:
      key: navyojana/backend
      property: DB_USER

  - secretKey: DB_PASSWORD
    remoteRef:
      key: navyojana/backend
      property: DB_PASSWORD
```

Apply

```bash
kubectl apply -f external-secret.yaml
```

Verify

```bash
kubectl get externalsecret -n navyojana

kubectl get secret -n navyojana
```

Expected

```
backend-secret
```

### Why?

The operator automatically creates the Kubernetes Secret.

No manual Secret creation is required.

---

# Secret Synchronization Flow

```
AWS Secrets Manager

↓

External Secrets Operator

↓

ClusterSecretStore

↓

ExternalSecret

↓

backend-secret

↓

Backend Deployment

↓

Amazon RDS
```

---

# Benefits

* No hardcoded passwords
* No secrets inside GitHub
* Automatic synchronization
* Automatic secret rotation support
* IAM-based authentication
* Production-grade security
* Centralized management

---

# Verification Commands

Check ClusterSecretStore

```bash
kubectl get clustersecretstore
```

Check External Secret

```bash
kubectl get externalsecret -n navyojana
```

Check Kubernetes Secret

```bash
kubectl get secret -n navyojana
```

Describe External Secret

```bash
kubectl describe externalsecret backend-secret -n navyojana
```

Describe Service Account

```bash
kubectl describe sa external-secrets -n external-secrets
```

---

# Common Errors

## Secret not found

```
backend-secret not found
```

Reason

ExternalSecret has not synchronized.

---

## SecretStore Invalid

Reason

Incorrect IAM Role or AWS Region.

---

## AccessDeniedException

Reason

IAM Policy is missing Secrets Manager permissions.

---

## SecretSynced=False

Reason

Secret name or property name does not match AWS Secrets Manager.

---

# Best Practices

* Never store AWS Access Keys inside Kubernetes.
* Use IRSA.
* Use ClusterSecretStore.
* Follow Least Privilege IAM policies.
* Rotate database passwords periodically.
* Store only application secrets in AWS Secrets Manager.
* Manage ExternalSecret and ClusterSecretStore using GitOps (Helm + Argo CD).

---

# Interview Questions

### What is External Secrets Operator?

Synchronizes secrets from external providers (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, etc.) into Kubernetes Secrets.

---

### What is IRSA?

IAM Roles for Service Accounts allow Kubernetes Pods to securely assume AWS IAM Roles without storing AWS credentials.

---

### Why use ClusterSecretStore?

It enables multiple namespaces to reuse the same AWS Secrets Manager configuration.

---

### Why not use Kubernetes Secrets directly?

They are Base64 encoded (not encrypted by default), require manual updates, and do not support centralized lifecycle management like AWS Secrets Manager.

---

# Conclusion

This implementation follows enterprise-grade DevOps practices by combining:

* Amazon EKS
* AWS Secrets Manager
* IAM Roles for Service Accounts (IRSA)
* External Secrets Operator
* Kubernetes
* Helm
* Argo CD

to provide secure, automated, and scalable secret management for containerized applications.

