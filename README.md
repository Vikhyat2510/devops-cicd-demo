# DevOps CI/CD Pipeline Project

A complete CI/CD pipeline implementation using GitHub Actions, Docker, and Kubernetes. This project demonstrates automated building, pushing Docker images to a container registry, and deploying to a Kubernetes cluster.

## 🏗️ Architecture

```
GitHub Repository → GitHub Actions → Docker Hub/GHCR → Kubernetes Cluster
```

## 📁 Project Structure

```
devops_final/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD pipeline
├── k8s/
│   ├── namespace.yaml         # Kubernetes namespace
│   ├── deployment.yaml        # Application deployment
│   ├── service.yaml          # Service configuration
│   ├── ingress.yaml          # Ingress configuration
│   └── hpa.yaml              # Horizontal Pod Autoscaler
├── server.js                 # Node.js Express application
├── package.json              # Node.js dependencies
├── Dockerfile                # Docker container configuration
├── .dockerignore             # Docker ignore file
├── .gitignore               # Git ignore file
└── README.md                # This file
```

## 🚀 Features

- **Automated Testing**: Runs tests on every push and pull request
- **Multi-Architecture Docker Builds**: Supports both AMD64 and ARM64
- **Container Registry Integration**: Pushes to Docker Hub or GitHub Container Registry
- **Kubernetes Deployment**: Automated deployment with health checks
- **Horizontal Pod Autoscaling**: Auto-scales based on CPU and memory usage
- **Security**: Non-root containers, security contexts, and resource limits
- **Health Checks**: Liveness and readiness probes

## 🛠️ Prerequisites

### 1. Docker Hub Account
- Create account at [Docker Hub](https://hub.docker.com/)
- Generate an access token in Account Settings → Security

### 2. Kubernetes Cluster
You need one of the following:
- **Local**: Minikube, Kind, or Docker Desktop with Kubernetes
- **Cloud**: AWS EKS, Google GKE, Azure AKS, or DigitalOcean Kubernetes
- **Self-hosted**: Your own Kubernetes cluster

### 3. GitHub Repository
- Fork or create a new repository
- Push this code to your repository

## ⚙️ Setup Instructions

### Step 1: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

#### Required Secrets:
```
DOCKERHUB_USERNAME=your_dockerhub_username
DOCKERHUB_TOKEN=your_dockerhub_access_token
KUBECONFIG=base64_encoded_kubeconfig_content
```

#### How to get KUBECONFIG:
```bash
# For local clusters (Minikube)
minikube config view --format base64

# For cloud clusters, download kubeconfig and encode:
cat ~/.kube/config | base64 -w 0
```

### Step 2: Update Docker Image Name

Edit `k8s/deployment.yaml` and replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username:

```yaml
image: your_username/devops-cicd-app:latest
```

### Step 3: Configure Kubernetes Cluster Access

#### For Local Development (Minikube):
```bash
# Start Minikube
minikube start

# Enable ingress addon
minikube addons enable ingress

# Get kubeconfig
minikube config view --format base64
```

#### For Cloud Clusters:
1. Download kubeconfig from your cloud provider
2. Encode it: `cat kubeconfig | base64 -w 0`
3. Add to GitHub secrets as `KUBECONFIG`

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Initial CI/CD pipeline setup"
git push origin main
```

## 🔄 CI/CD Pipeline Flow

### 1. **Test Stage**
- Checks out code
- Sets up Node.js environment
- Installs dependencies
- Runs tests and linting

### 2. **Build & Push Stage** (on main branch)
- Builds Docker image with multi-architecture support
- Pushes to Docker Hub with tags
- Uses Docker layer caching for faster builds

### 3. **Deploy Stage** (on main branch)
- Configures kubectl
- Updates deployment with new image
- Applies all Kubernetes manifests
- Verifies deployment health

### 4. **Notify Stage**
- Reports deployment status

## 🧪 Testing the Pipeline

### Local Testing:
```bash
# Build and test locally
docker build -t devops-cicd-app .
docker run -p 3000:3000 devops-cicd-app

# Test the application
curl http://localhost:3000/health
```

### Kubernetes Testing:
```bash
# Apply manifests manually
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n devops-demo
kubectl get services -n devops-demo

# Port forward for testing
kubectl port-forward -n devops-demo svc/devops-cicd-app-service 8080:80
curl http://localhost:8080/health
```

## 📊 Monitoring and Observability

### Health Endpoints:
- `GET /health` - Application health check
- `GET /api/status` - Detailed status information

### Kubernetes Resources:
- **Deployment**: 3 replicas with rolling updates
- **Service**: ClusterIP service on port 80
- **Ingress**: External access (configure host in ingress.yaml)
- **HPA**: Auto-scaling based on CPU (70%) and memory (80%)

## 🔧 Customization

### Environment Variables:
Add to `k8s/deployment.yaml`:
```yaml
env:
- name: CUSTOM_VAR
  value: "custom_value"
- name: SECRET_VAR
  valueFrom:
    secretKeyRef:
      name: app-secrets
      key: secret-key
```

### Resource Limits:
Modify in `k8s/deployment.yaml`:
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Scaling:
Update `k8s/hpa.yaml`:
```yaml
minReplicas: 3
maxReplicas: 20
```

## 🚨 Troubleshooting

### Common Issues:

1. **Docker Hub Authentication Failed**
   - Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets
   - Check token permissions

2. **Kubernetes Connection Failed**
   - Verify `KUBECONFIG` secret is base64 encoded
   - Check cluster accessibility

3. **Deployment Stuck**
   - Check pod logs: `kubectl logs -n devops-demo deployment/devops-cicd-app`
   - Verify image exists: `docker pull your_username/devops-cicd-app:latest`

4. **Health Check Failures**
   - Verify application starts correctly
   - Check health endpoint: `curl http://localhost:3000/health`

### Debug Commands:
```bash
# Check GitHub Actions logs
# Go to Actions tab in your repository

# Check Kubernetes resources
kubectl get all -n devops-demo
kubectl describe deployment devops-cicd-app -n devops-demo

# Check pod logs
kubectl logs -n devops-demo -l app=devops-cicd-app

# Check events
kubectl get events -n devops-demo --sort-by='.lastTimestamp'
```

## 🔐 Security Best Practices

- ✅ Non-root containers
- ✅ Read-only root filesystem
- ✅ Dropped capabilities
- ✅ Resource limits
- ✅ Security contexts
- ✅ Health checks
- ✅ Secrets management

## 📈 Next Steps

1. **Add Monitoring**: Integrate Prometheus and Grafana
2. **Implement Blue-Green Deployment**: For zero-downtime deployments
3. **Add Database**: Integrate with PostgreSQL or MongoDB
4. **Implement Logging**: Add centralized logging with ELK stack
5. **Add Security Scanning**: Integrate vulnerability scanning in CI/CD

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Check Kubernetes events and logs
4. Create an issue in the repository

---

**Happy Deploying! 🚀**
