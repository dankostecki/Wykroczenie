import { useState, useCallback } from "react";
import { MediaFile } from "../types";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      return reject("Google Identity Services nie załadowane");
    }

    // @ts-ignore
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          resolve(tokenResponse.access_token);
        } else {
          reject("Nie udało się pobrać tokenu Google");
        }
      },
    });
    tokenClient.requestAccessToken();
  });
}

function createDriveFolder(token: string, folderName: string): Promise<string> {
  return fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  })
    .then(r => r.json())
    .then(data => data.id);
}

function shareFolderAnyone(token: string, folderId: string): Promise<any> {
  return fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone'
    })
  }).then(r => r.json());
}

function uploadFileToDrive(
  token: string,
  file: File,
  folderId: string,
  onProgress?: (percent: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const metadata = {
      name: file.name,
      parents: [folderId]
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const reader = new FileReader();
    reader.onload = function (e) {
      const contentType = file.type || 'application/octet-stream';
      const base64Data = btoa(
        new Uint8Array(e.target!.result as ArrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.setRequestHeader('Content-Type', 'multipart/related; boundary="' + boundary + '"');

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable && typeof onProgress === 'function') {
          let percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(xhr.responseText);
        }
      };

      xhr.onerror = function () {
        reject("Błąd połączenia z Google Drive");
      };

      xhr.send(multipartRequestBody);
    };
    reader.readAsArrayBuffer(file);
  });
}

export function useGoogleDriveUpload() {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(async (files: MediaFile[]) => {
    setProgress(0);
    setIsUploading(true);
    setError(null);
    setFolderId(null);
    setFolderUrl(null);

    try {
      const token = await getAccessToken();

      const now = new Date();
      const folderName = `Zgłoszenie_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;

      const createdFolderId = await createDriveFolder(token, folderName);
      setFolderId(createdFolderId);
      setFolderUrl(`https://drive.google.com/drive/folders/${createdFolderId}`);

      await shareFolderAnyone(token, createdFolderId);

      for (let i = 0; i < files.length; i++) {
        await uploadFileToDrive(token, files[i].file, createdFolderId, percent => {
          setProgress(Math.round(((i + percent / 100) / files.length) * 100));
        });
      }
      setProgress(100);
      setIsUploading(false);

      return { folderId: createdFolderId, folderUrl: `https://drive.google.com/drive/folders/${createdFolderId}` };
    } catch (err: any) {
      setError(String(err));
      setIsUploading(false);
      throw err;
    }
  }, []);

  return {
    uploadFiles,
    progress,
    isUploading,
    folderId,
    folderUrl,
    error,
  };
}
