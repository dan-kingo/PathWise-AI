import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage for resume uploads
export const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'job-ready-ai-coach/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // For non-image files
    public_id: (req: any, _file: any) => {
      const userId = req.user?.id || 'anonymous';
      const timestamp = Date.now();
      return `resume_${userId}_${timestamp}`;
    },
  } as any,
});

export default cloudinary;