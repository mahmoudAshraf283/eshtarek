# Eshtarek - Multi-tenant Subscription Platform

A modern SaaS platform for managing multi-tenant subscriptions with role-based access control.

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Tenant Owner, Tenant User)
- Secure password handling
- Token refresh mechanism

### Multi-tenant System
- Tenant isolation
- User management per tenant
- Role-based permissions
- User limit enforcement

### Subscription Management
- Multiple subscription plans
- Automated billing (mock implementation)
- Plan upgrades/downgrades
- Usage tracking
- User limit enforcement

### Admin Features
- Custom admin interface
- Subscription tracking
- Revenue monitoring
- User management
- Tenant management

## Technology Stack

### Backend
- Django 5.2.5
- Django REST Framework 3.16.1
- PostgreSQL 14
- JWT Authentication

### Frontend
- React 19
- React Bootstrap
- Formik & Yup
- Axios

### DevOps
- Docker
- Docker Compose

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/mahmoudAshraf283/eshtarek.git
cd eshtarek
```

2. Start the services using Docker:
```bash
docker-compose up --build
```

3. Create initial subscription plans:
```bash
docker-compose exec backend python manage.py shell
```

```python
from users.models import SubscriptionPlan

plans = [
    {
        "name": "free",
        "price": 0.00,
        "max_users": 5,
        "description": "Basic features for small teams",
        "features": "Basic Support,1 Project,5 Users,Basic Analytics"
    },
    {
        "name": "pro",
        "price": 29.99,
        "max_users": 20,
        "description": "Advanced features for growing teams",
        "features": "Priority Support,Unlimited Projects,20 Users,Advanced Analytics,API Access"
    },
    {
        "name": "enterprise",
        "price": 99.99,
        "max_users": 100,
        "description": "Full features for large organizations",
        "features": "24/7 Support,Unlimited Everything,Custom Integration,Dedicated Account Manager"
    }
]

for plan_data in plans:
    SubscriptionPlan.objects.get_or_create(
        name=plan_data["name"],
        defaults=plan_data
    )
```

4. Create a superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/users/register/
{
    "username": "string",
    "email": "string",
    "password": "string",
    "tenant_name": "string",
    "is_tenant_owner": boolean
}
```

#### Login
```
POST /api/users/login/
{
    "username": "string",
    "password": "string",
    "is_admin": boolean
}
```

#### Logout
```
POST /api/users/logout/
{
    "refresh": "string"
}
```

### Subscription Endpoints

#### List Plans
```
GET /api/users/subscription-plans/
```

#### Create/Update Subscription
```
POST /api/users/subscriptions/
{
    "plan": "integer",
    "payment_id": "string"
}
```

## Sample Test Data

1. Create test users:
```python
# Admin User
User.objects.create_superuser(
    username="admin",
    email="admin@example.com",
    password="admin123"
)

# Tenant Owner
tenant = Tenant.objects.create(name="Sample Company")
User.objects.create_user(
    username="owner",
    email="owner@example.com",
    password="owner123",
    role="tenant_owner",
    tenant=tenant
)

# Tenant User
User.objects.create_user(
    username="user",
    email="user@example.com",
    password="user123",
    role="tenant_user",
    tenant=tenant
)
```

## Development

1. Run backend tests:
```bash
docker-compose exec backend python manage.py test
```

2. Access services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Interface: http://localhost:8000/admin

## Project Structure

```
eshtarek/
├── backend/
│   ├── users/
│   │   ├── api/
│   │   ├── migrations/
│   │   ├── models.py
│   │   └── admin.py
│   └── eshtarek/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
└── docker-compose.yml
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## AI HELPERS

1. Github Copilot
2. Deepseek
