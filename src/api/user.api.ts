import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { handleAxiosError } from "../utils/helper";

const FILE_SERVICE_URL = process.env.FILE_SERVICE_URL || "http://13.127.188.130:3003/file";

// Upload files to S3 via file-service
export const uploadFiles = async (
  files: any[],
  type: string,
  id: string,
  token?: string
) => {
  try {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append("files", fs.createReadStream(file.path), file.originalname);
    });
    formData.append("type", type);
    formData.append("id", id);

    const { data } = await axios.post(
      `${FILE_SERVICE_URL}/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...(token && { Authorization: token }),
        },
      }
    );
    return data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get multiple files by IDs (returns signed URLs)
export const getFilesByIds = async (fileIds: string[], token?: string) => {
  if (!fileIds || fileIds.length === 0) return [];
  
  try {
    const { data } = await axios.post(
      `${FILE_SERVICE_URL}/get`,
      { file_ids: fileIds },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );
    return data?.data || [];
  } catch {
    // Return empty array instead of throwing - missing files shouldn't break the response
    return [];
  }
};

// Get single file by ID (returns signed URL)
export const getFileById = async (fileId: string, token?: string) => {
  try {
    const { data } = await axios.get(
      `${FILE_SERVICE_URL}/get/${fileId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );
    return data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getUserById = async (userId: string, token?: string) => {
  try {
    const { data } = await axios.get(
      `${FILE_SERVICE_URL}/get-by-user-id?id=${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );
    return data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get files by listing ID (returns signed URLs for all images of a listing)
export const getFilesByListingId = async (listingId: string, token?: string) => {
  if (!listingId) return [];
  
  try {
    const { data } = await axios.get(
      `${FILE_SERVICE_URL}/get-by-listing-id?listing_id=${listingId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );
    return data?.data || [];
  } catch {
    // Return empty array - no files found is a valid case
    return [];
  }
};

// Delete multiple files by IDs
export const deleteFilesByIds = async (fileIds: string[], token?: string) => {
  try {
    const { data } = await axios.post(
      `${FILE_SERVICE_URL}/delete`,
      { file_ids: fileIds },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );
    return data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Delete single file by ID
export const deleteFileById = async (fileId: string, token?: string) => {
  try {
    const { data } = await axios.delete(
      `${FILE_SERVICE_URL}/delete/${fileId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );
    return data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};