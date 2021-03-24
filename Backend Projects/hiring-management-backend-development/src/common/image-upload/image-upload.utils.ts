import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const imageandpdfFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG|pdf|PDF)$/)) {
    return callback(new Error('Only image & pdf files are allowed!'), false);
  }
  callback(null, true);
};

export const candidateFileFilter = (req, file, callback) => {
  if(file.fieldname === 'resume'){
    if (!file.originalname.match(/\.(doc|DOC|docx|DOCX|PDF|pdf)$/)) {
      return callback(new Error('Only pdf & doc files are allowed in resume'), false);
    }
  }else{
    if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
      return callback(new Error('Only image files are allowed in candidate photo'), false);
    }
  } 
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = uuidv4();
  callback(null, `${name}-${randomName}${fileExtName}`);
};
