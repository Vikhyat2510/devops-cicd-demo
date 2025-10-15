# 🚀 Complete Setup Guide for CI/CD Pipeline

This guide will walk you through setting up the entire CI/CD pipeline step by step.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub account
- [ ] Docker Hub account
- [ ] Kubernetes cluster access (local or cloud)
- [ ] Git installed locally
- [ ] Basic understanding of Docker and Kubernetes

## 🎯 Step-by-Step Implementation

### Step 1: Create Docker Hub Account and Token

1. **Go to [Docker Hub](https://hub.docker.com/)**
2. **Sign up** for a free account
3. **Create Access Token**:
   - Go to Account Settings → Security
   - Click "New Access Token"
   - Name it "GitHub Actions CI/CD"
   - Copy the token (you'll need it later)

### Step 2: Set Up Kubernetes Cluster

#### Option A: Local Development (Minikube)
```bash
# Install Minikube (if not already installed)
# Windows (using Chocolatey):
choco install minikube

# macOS (using Homebrew):
brew install minikube

# Linux:
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start Minikube
minikube start

# Enable ingress addon
minikube addons enable ingress

# Verify cluster is running
kubectl get nodes
```

#### Option B: Cloud Cluster (AWS EKS Example)
```bash
# Install AWS CLI and eksctl
# Create EKS cluster
eksctl create cluster --name devops-demo --region us-west-2 --nodegroup-name workers --node-type t3.medium --nodes 2

# Update kubeconfig
aws eks update-kubeconfig --region us-west-2 --name devops-demo
```

#### Option C: Docker Desktop Kubernetes
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Enable Kubernetes
4. Click "Apply & Restart"

### Step 3: Create GitHub Repository

1. **Go to [GitHub](https://github.com/)**
2. **Create new repository**:
   - Name: `devops-cicd-demo`
   - Description: "CI/CD Pipeline with GitHub Actions, Docker, and Kubernetes"
   - Make it public or private (your choice)
   - Don't initialize with README (we already have one)

### Step 4: Clone and Push Code

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/devops-cicd-demo.git
cd devops-cicd-demo

# Copy all the files from this project to your repository
# (Copy all files created in the previous steps)

# Add and commit files
git add .
git commit -m "Initial CI/CD pipeline setup"

# Push to GitHub
git push origin main
```

### Step 5: Configure GitHub Secrets

1. **Go to your GitHub repository**
2. **Navigate to Settings → Secrets and variables → Actions**
3. **Add the following secrets**:

#### Required Secrets:

**DOCKERHUB_USERNAME**
- Name: `DOCKERHUB_USERNAME`
- Value: `your_dockerhub_username`

**DOCKERHUB_TOKEN**
- Name: `DOCKERHUB_TOKEN`
- Value: `your_dockerhub_access_token` (from Step 1)

**KUBECONFIG**
- Name: `KUBECONFIG`
- Value: `base64_encoded_kubeconfig`

#### How to get KUBECONFIG:

**For Minikube:**
```bash
minikube config view --format base64
```

**For Cloud Clusters:**
```bash
# Get your kubeconfig file
cat ~/.kube/config | base64 -w 0
```

**For Docker Desktop:**
```bash
# On Windows
cat %USERPROFILE%\.kube\config | base64

# On macOS/Linux
cat ~/.kube/config | base64
```

### Step 6: Update Configuration Files

1. **Edit `k8s/deployment.yaml`**:
   ```yaml
   # Replace YOUR_DOCKERHUB_USERNAME with your actual username
   image: your_username/devops-cicd-app:latest
   ```

2. **Update `k8s/ingress.yaml`** (optional):
   ```yaml
   # Change the host to match your setup
   - host: your-app.local  # or your actual domain
   ```

### Step 7: Test the Pipeline

1. **Make a small change** to trigger the pipeline:
   ```bash
   # Edit server.js to add a comment
   echo "// Test commit" >> server.js
   
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```

2. **Monitor the pipeline**:
   - Go to your GitHub repository
   - Click on "Actions" tab
   - Watch the workflow run

### Step 8: Verify Deployment

#### Check GitHub Actions:
1. Go to Actions tab in your repository
2. Click on the latest workflow run
3. Verify all steps completed successfully

#### Check Kubernetes Deployment:
```bash
# Check if namespace exists
kubectl get namespaces | grep devops-demo

# Check pods
kubectl get pods -n devops-demo

# Check services
kubectl get services -n devops-demo

# Check deployment status
kubectl get deployment -n devops-demo

# View pod logs
kubectl logs -n devops-demo -l app=devops-cicd-app
```

#### Test the Application:
```bash
# Port forward to access the application
kubectl port-forward -n devops-demo svc/devops-cicd-app-service 8080:80

# Test in another terminal
curl http://localhost:8080/health
curl http://localhost:8080/
```

## 🔧 Browser Configuration (If Needed)

### For Local Development:

1. **Minikube Ingress**:
   ```bash
   # Get the ingress IP
   minikube ip
   
   # Add to /etc/hosts (Linux/macOS) or C:\Windows\System32\drivers\etc\hosts (Windows)
   # 192.168.49.2 devops-demo.local
   ```

2. **Access via Browser**:
   - Open browser
   - Go to `http://devops-demo.local`
   - You should see the application

### For Cloud Clusters:

1. **Get External IP**:
   ```bash
   kubectl get ingress -n devops-demo
   ```

2. **Update DNS** (if using custom domain):
   - Point your domain to the external IP
   - Or use the provided load balancer URL

## 🚨 Troubleshooting Common Issues

### Issue 1: Docker Hub Authentication Failed
**Error**: `denied: requested access to the resource is denied`

**Solution**:
- Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets
- Check if the token has the correct permissions
- Ensure the username is correct (case-sensitive)

### Issue 2: Kubernetes Connection Failed
**Error**: `Unable to connect to the server`

**Solution**:
- Verify `KUBECONFIG` secret is properly base64 encoded
- Check if the cluster is accessible from GitHub Actions
- For local clusters, ensure they're running

### Issue 3: Image Pull Failed
**Error**: `Failed to pull image`

**Solution**:
- Check if the Docker image was pushed successfully
- Verify the image name in deployment.yaml
- Check Docker Hub repository permissions

### Issue 4: Pods Stuck in Pending
**Error**: Pods not starting

**Solution**:
```bash
# Check pod events
kubectl describe pod -n devops-demo <pod-name>

# Check resource availability
kubectl top nodes
kubectl describe nodes
```

### Issue 5: Health Check Failures
**Error**: Readiness/Liveness probe failed

**Solution**:
- Check application logs: `kubectl logs -n devops-demo <pod-name>`
- Verify the health endpoint works: `curl http://localhost:3000/health`
- Check if the application is binding to the correct port

## 📊 Monitoring Your Deployment

### Useful Commands:
```bash
# Watch pods in real-time
kubectl get pods -n devops-demo -w

# Check resource usage
kubectl top pods -n devops-demo

# View all resources
kubectl get all -n devops-demo

# Check events
kubectl get events -n devops-demo --sort-by='.lastTimestamp'
```

### GitHub Actions Monitoring:
- Go to Actions tab in your repository
- Click on any workflow run to see detailed logs
- Check the "Deploy" job for deployment status

## 🎉 Success Indicators

You'll know everything is working when:

✅ GitHub Actions workflow completes successfully  
✅ Docker image is pushed to Docker Hub  
✅ Kubernetes pods are running and ready  
✅ Health checks pass  
✅ Application responds to HTTP requests  

## 🔄 Making Changes

To test the full pipeline:

1. **Make a code change**:
   ```bash
   # Edit server.js
   echo "console.log('New version deployed!');" >> server.js
   ```

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```

3. **Watch the pipeline**:
   - Monitor GitHub Actions
   - Check Kubernetes deployment
   - Verify the new version is running

## 🚀 Next Steps

Once your basic pipeline is working:

1. **Add more tests** to the application
2. **Implement database integration**
3. **Add monitoring and logging**
4. **Set up staging environment**
5. **Implement blue-green deployments**

---

**Congratulations! 🎉 You now have a fully automated CI/CD pipeline!**

If you encounter any issues, refer to the troubleshooting section or check the GitHub Actions logs for detailed error messages.
