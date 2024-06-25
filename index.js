import express, { urlencoded } from "express";
import { v2 as cloudinary } from "cloudinary";
import signUp from "./signup/singupRoute.js";
import userRoutes from "./user/userRoute.js";
import postRoutes from "./post/postRoute.js";
import notificationRoutes from "./notifications/notifRoute.js";
import dotenv from "dotenv";
import connectMongodb from "./db/database.js";
import fs from 'fs';
import winston from 'winston'
import morgan from 'morgan'
import helmet from 'helmet'
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const app = express();



app.get('/api/example', (req, res) => {
  // console.log(`Received a GET request on /api/example`);
  res.send('This is an example route');
});
app.use(morgan('combined', { stream: { write: (message) => logger.info(message) } }));
app.use(express.json());
app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'trusted-cdn.com'],
      // Add more directives as needed
    },
  })
);
const PORT = process.env.PORT || 5000;
app.all('*', (req, res) => {
  res.status(500).json({
    statusCode: 500,
    message: "Invalid Route"
  });
});

const logDirectory = './logs';

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logFile = fs.createWriteStream(`${logDirectory}/logs-${new Date().toISOString().split('T')[0]}.txt`, { flags: 'a' });

// Create a Pino logger
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: `${logDirectory}/logs-${new Date().toISOString().split('T')[0]}.txt`,
      level: 'info',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});


app.use(morgan('combined', { stream: { write: (message) => logger.info(message) } }));
app.use(express.json());
app.use("/social/auth", signUp);
app.use("/social/users", userRoutes);
app.use("/social/posts", postRoutes);
app.use("/social/notifications",notificationRoutes);


app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
  connectMongodb();
});

export default app
