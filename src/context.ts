import axios from "axios";

// Define the function to upload the image
export const UPLOAD_IPFS_IMAGE = async (file: File): Promise<string | undefined> => {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Sending the file to Pinata's API for pinning
      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,  
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
          "Content-Type": "multipart/form-data",
        },
      });
      
      const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      console.log("Image uploaded to Pinata:", ImgHash);  
      return ImgHash;
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      return undefined; 
    }
  }
  return undefined;  
};
