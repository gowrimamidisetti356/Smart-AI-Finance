const mongoose = require('mongoose');

const placeholderError = () => {
  const error = new Error(
    'MONGODB_URI contains placeholder credentials. Replace them with your real MongoDB Atlas database-user credentials, URL-encode special characters, then restart the server'
  );
  error.code = 'DATABASE_CONFIG';
  return error;
};

const connectDB = async () => {
  const connectionString = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!connectionString) {
    throw new Error('MONGODB_URI is required to connect to MongoDB (MONGO_URI is also accepted)');
  }
  if (
    /^your[_-]?mongodb[_-]?url$/i.test(connectionString.trim()) ||
    /<[^<>]+>/.test(connectionString) ||
    /your[_-]?password/i.test(connectionString)
  ) {
    throw placeholderError();
  }

  const uriMatch = connectionString.match(/^mongodb(?:\+srv)?:\/\/([^/?#]+)(?:[/?#]|$)/i);
  if (!uriMatch) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string');
  }

  const authority = uriMatch[1];
  const credentialSeparator = authority.lastIndexOf('@');
  if (credentialSeparator !== -1) {
    const credentials = authority.slice(0, credentialSeparator);
    const passwordSeparator = credentials.indexOf(':');
    let username = credentials;
    let password = '';
    try {
      if (passwordSeparator !== -1) {
        username = decodeURIComponent(credentials.slice(0, passwordSeparator));
        password = decodeURIComponent(credentials.slice(passwordSeparator + 1));
      } else {
        username = decodeURIComponent(credentials);
      }
    } catch {
      throw new Error('MONGODB_URI contains invalid percent-encoding in its credentials');
    }
    if (/^<[^<>]+>$/.test(username) || /^<[^<>]+>$/.test(password) || /^your[_-]?password$/i.test(password)) {
      throw placeholderError();
    }
  }

  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB Connected');
};

module.exports = { connectDB, mongoose };
