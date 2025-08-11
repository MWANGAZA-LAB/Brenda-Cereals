# Brenda Cereals - Deployment Guide

## Overview
This guide covers deploying the Brenda Cereals Next.js application to various platforms including Docker, Vercel, GitHub Pages, and AWS.

## Prerequisites
- Node.js 20.x or later
- Docker (for containerized deployment)
- Git
- Access to deployment platforms

## Quick Start

### 1. Local Development
```bash
# Install dependencies
npm run install-all

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### 2. Docker Deployment

#### Build and Run Locally
```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:prod

# Run development environment
npm run docker:dev
```

#### Deploy to Docker Hub
```bash
# Login to Docker Hub
docker login

# Build and push
docker build -t yourusername/brenda-cereals:latest .
docker push yourusername/brenda-cereals:latest
```

### 3. Vercel Deployment

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on every push to main branch
3. Configure environment variables in Vercel dashboard

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

### 4. GitHub Pages Deployment

#### Setup
1. Enable GitHub Pages in repository settings
2. Set source to GitHub Actions
3. The deployment workflow will automatically build and deploy

#### Manual Deployment
```bash
# Build static export
cd apps/web
npm run build
npm run export

# Deploy to gh-pages branch
npx gh-pages -d out
```

### 5. AWS Deployment

#### ECS Deployment
1. Create ECR repository
2. Build and push Docker image
3. Create ECS cluster and service
4. Configure load balancer

#### Manual Steps
```bash
# Configure AWS CLI
aws configure

# Create ECR repository
aws ecr create-repository --repository-name brenda-cereals

# Build and push
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t brenda-cereals .
docker tag brenda-cereals:latest your-account.dkr.ecr.us-east-1.amazonaws.com/brenda-cereals:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/brenda-cereals:latest
```

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Payment (M-Pesa)
MPESA_CONSUMER_KEY="your-consumer-key"
MPESA_CONSUMER_SECRET="your-consumer-secret"
MPESA_PASSKEY="your-passkey"
MPESA_BUSINESS_SHORT_CODE="your-short-code"
MPESA_ENVIRONMENT="sandbox" # or "live"
```

### Optional Variables
```bash
# Redis
REDIS_URL="redis://localhost:6379"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
```

## Database Setup

### PostgreSQL
```bash
# Create database
createdb brenda_cereals

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

### Docker Database
```bash
# Start PostgreSQL with Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=brenda_cereals -p 5432:5432 -d postgres:15
```

## Production Checklist

### Before Deployment
- [ ] All tests passing
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates ready
- [ ] Domain configured

### After Deployment
- [ ] Health check endpoint responding
- [ ] Database connections working
- [ ] Payment integration tested
- [ ] Email functionality verified
- [ ] Performance monitoring active
- [ ] Backup strategy implemented

## Monitoring and Maintenance

### Health Checks
```bash
# Check application health
curl https://yourdomain.com/api/health

# Check database connection
curl https://yourdomain.com/api/health/db

# Check payment status
curl https://yourdomain.com/api/payments/status
```

### Logs
```bash
# View application logs
docker logs brenda-cereals-web

# View database logs
docker logs brenda-cereals-postgres

# View nginx logs (if using reverse proxy)
docker logs brenda-cereals-nginx
```

### Performance
```bash
# Run Lighthouse audit
npx lighthouse https://yourdomain.com

# Check bundle size
npm run build
npx @next/bundle-analyzer .next/static/chunks/*.js
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Database Connection Issues
```bash
# Check database status
docker ps | grep postgres

# Restart database
docker restart brenda-cereals-postgres

# Check connection string
echo $DATABASE_URL
```

#### Payment Integration Issues
```bash
# Check M-Pesa credentials
echo $MPESA_CONSUMER_KEY
echo $MPESA_ENVIRONMENT

# Test payment endpoint
curl -X POST https://yourdomain.com/api/payments/mpesa/initiate
```

### Support
- Check GitHub Issues for known problems
- Review deployment logs in GitHub Actions
- Monitor application metrics and alerts

## Security Considerations

### Production Security
- Use HTTPS everywhere
- Implement rate limiting
- Regular security updates
- Monitor for vulnerabilities
- Secure environment variables
- Implement proper CORS policies

### Database Security
- Use strong passwords
- Limit database access
- Regular backups
- Monitor access logs
- Use connection pooling

## Cost Optimization

### AWS Cost Optimization
- Use reserved instances
- Implement auto-scaling
- Monitor resource usage
- Use spot instances for non-critical workloads
- Implement cost alerts

### Vercel Cost Optimization
- Use appropriate plan tier
- Monitor bandwidth usage
- Optimize bundle size
- Use edge functions strategically

## Backup and Recovery

### Database Backups
```bash
# Create backup
pg_dump brenda_cereals > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql brenda_cereals < backup_file.sql
```

### Application Backups
```bash
# Backup environment variables
cp .env .env.backup

# Backup configuration files
cp -r config/ config.backup/
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancers
- Implement session sharing
- Use shared databases
- Implement caching strategies

### Vertical Scaling
- Monitor resource usage
- Upgrade instance types
- Optimize database queries
- Implement CDN for static assets

## Conclusion
This deployment guide covers the essential aspects of deploying Brenda Cereals to production. Always test deployments in staging environments first and maintain proper monitoring and alerting systems.

For additional support, refer to the project documentation or create an issue in the GitHub repository.
