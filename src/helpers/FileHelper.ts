import api from "../api/axiosConfig";

type ImportUsersResponse = {
  success: boolean;
  message: string;
  usersCount?: number;
};

const EXCEL_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

const EXCEL_EXTENSIONS = [".xlsx", ".xls"];

/**
 * Validates if a file is an Excel file
 */
const isExcelFile = (file: File): boolean => {
  const hasValidMimeType = EXCEL_MIME_TYPES.includes(file.type);
  const hasValidExtension = EXCEL_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  return hasValidMimeType || hasValidExtension;
};

/**
 * Imports volunteers from an Excel file
 * @param file - The Excel file to import
 * @param collectionId - The collection ID
 * @param token - The authentication token
 * @returns Promise with the import result
 */
export const importVolunteersFromExcel = async (
  file: File,
  collectionId: number,
  token: string,
): Promise<ImportUsersResponse> => {
  // Validate file
  if (!file) {
    return {
      success: false,
      message: "Aucun fichier n'a été sélectionné.",
    };
  }

  // Check if it's an Excel file
  if (!isExcelFile(file)) {
    return {
      success: false,
      message:
        "Le fichier doit être un fichier Excel (.xlsx ou .xls). Le fichier sélectionné n'est pas valide.",
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      success: false,
      message: "Le fichier est trop volumineux. Taille maximale : 10 Mo.",
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ImportUsersResponse>(
      `/collections/${collectionId}/users`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return {
      success: true,
      message:
        response.data.message || "Les bénévoles ont été importés avec succès.",
      usersCount: response.data.usersCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: `Erreur lors de l'import : ${error.message}`,
      };
    }

    return {
      success: false,
      message: "Une erreur est survenue lors de l'import des bénévoles.",
    };
  }
};

export default {
  importVolunteersFromExcel,
};
