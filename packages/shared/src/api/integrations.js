import { invokeFunction } from './supabaseFunctions.js';

export const Core = {
    InvokeLLM: invokeFunction('InvokeLLM'),
    SendEmail: invokeFunction('SendEmail'),
    UploadFile: invokeFunction('UploadFile'),
    GenerateImage: invokeFunction('GenerateImage'),
    ExtractDataFromUploadedFile: invokeFunction('ExtractDataFromUploadedFile'),
    CreateFileSignedUrl: invokeFunction('CreateFileSignedUrl'),
    UploadPrivateFile: invokeFunction('UploadPrivateFile'),
};

export const InvokeLLM = Core.InvokeLLM;

export const SendEmail = Core.SendEmail;

export const UploadFile = Core.UploadFile;

export const GenerateImage = Core.GenerateImage;

export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;

export const CreateFileSignedUrl = Core.CreateFileSignedUrl;

export const UploadPrivateFile = Core.UploadPrivateFile;
