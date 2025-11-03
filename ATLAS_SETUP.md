# MongoDB Atlas Setup Guide

Follow these steps to get your MongoDB Atlas cluster and connection string:

## Step 1: Create Account & Cluster
1. Go to https://cloud.mongodb.com
2. Sign up for a free account (or log in if you have one)
3. Click "Build a Database"
4. Choose **FREE** tier (M0 Sandbox)
5. Select a cloud provider and region (any will work)
6. Click "Create Cluster" (takes 1-3 minutes to provision)

## Step 2: Create Database User
1. On the left menu, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username (e.g., `admin` or `demo_user`)
5. Set password (write it down!)
6. Set role to "Read and write to any database"
7. Click "Add User"

## Step 3: Whitelist IP Address
1. On the left menu, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) - for testing only
4. Click "Confirm"

## Step 4: Get Connection String
1. Go back to "Database" (left menu)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net`)
5. Replace `<password>` with your actual password
6. Replace `username` with your actual username

## Step 5: Update .env File
1. In your project folder, copy `.env.example` to `.env`
2. Edit `.env` and paste your connection string:
   ```
   MONGO_URI=mongodb+srv://your-user:your-password@cluster0.xxxxx.mongodb.net
   DB_NAME=nosql_demo
   ```
3. Save the file

## Step 6: Run the Demo
```powershell
npm start
```

That's it! The demo will connect to your Atlas cluster and run all 15+ operations.
