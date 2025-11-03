# Google Colab Setup - Quick Start

## Why Colab?
Google Colab is a free Jupyter notebook environment that runs in the cloud. No local MongoDB installation needed - just connect to MongoDB Atlas and run!

## Step 1: Upload Notebook to Colab

1. Go to https://colab.research.google.com
2. Click "File" → "Upload notebook"
3. Upload `MongoDB_Operations_Demo.ipynb` from this folder
4. OR use "GitHub" tab and paste this repo URL if you pushed it to GitHub

## Step 2: Get MongoDB Atlas Connection String (5 minutes)

1. Go to https://cloud.mongodb.com
2. Sign up for free account
3. Click "Build a Database" → Choose **FREE** tier (M0 Sandbox)
4. Click "Create Cluster" (wait 1-3 min)
5. Create database user:
   - Left menu → "Database Access" → "Add New Database User"
   - Username: `demo_user`
   - Password: create and save it
   - Role: "Read and write to any database"
6. Whitelist IP:
   - Left menu → "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
7. Get connection string:
   - Left menu → "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the string: `mongodb+srv://demo_user:<password>@cluster0.xxxxx.mongodb.net`
   - Replace `<password>` with your actual password

## Step 3: Run in Colab

1. In the Colab notebook, find cell 2 (Configuration cell)
2. Replace the `MONGO_URI` value with your actual connection string:
   ```python
   MONGO_URI = "mongodb+srv://demo_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net"
   ```
3. Click "Runtime" → "Run all"
4. Watch all 18 MongoDB operations execute!

## What the Notebook Demonstrates

The notebook runs 18 MongoDB operations:

**Create (INSERT):**
1. insertOne - single document
2. insertMany - multiple documents

**Read (FIND):**
3. find - all documents
4. find with filter - query by field
5. findOne - single document
6. projection, sort, limit - advanced queries

**Update:**
7. updateOne - update single document
8. updateMany - update multiple documents
9. upsert - insert if not exists
10. replaceOne - replace entire document

**Delete:**
11. deleteOne - delete single document
12. deleteMany - delete multiple documents

**Advanced:**
13. countDocuments - count queries
14. distinct - unique values
15. aggregate - aggregation pipeline
16. bulkWrite - batch operations
17. createIndex - indexing
18. text search - full-text search

## Benefits of Colab Approach

✅ No local MongoDB installation needed
✅ No Node.js or npm required
✅ Runs in browser on any device
✅ Free to use
✅ Easy to share with classmates
✅ Can download as .ipynb or .py file
✅ Results displayed inline

## Troubleshooting

**Connection failed?**
- Check your Atlas connection string is correct
- Make sure password has no special characters that need URL encoding
- Verify IP whitelist includes 0.0.0.0/0
- Check database user has proper permissions

**Cells won't run?**
- Click "Runtime" → "Restart runtime" and try again
- Make sure you're running cells in order (top to bottom)

## Next Steps

After running the notebook:
- Modify operations to test different queries
- Add your own operations
- Export results to CSV or JSON
- Share notebook link with instructor/classmates
