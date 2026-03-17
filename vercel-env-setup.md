# 🔧 URGENT: Missing Vercel Environment Variables

## Problem Identified
The article page is stuck on "Loading article..." because **Vercel production environment is missing the database connection variables**.

## Required Environment Variables

Add these to your Vercel project dashboard:

### 1. TURSO_DATABASE_URL
```
libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io
```

### 2. TURSO_AUTH_TOKEN
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg
```

### 3. JWT_SECRET
```
yXgZxJsaRG8o7EBMCXknL6XFW7V9SmmgE
```

## How to Add to Vercel

1. Go to https://vercel.com/dashboard
2. Find your kiala-app-project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Set Environment to: **Production, Preview, Development**
6. Redeploy the project

## This Will Fix

✅ Article loading (no more loading spinner)  
✅ Comparison table displaying properly  
✅ $ symbols showing correctly  
✅ All widget content rendering  

The database has the correct data - it just can't connect in production!