export type FormValues = {
  lastName: string;
  firstName: string;
  phoneNumber: string;
  birthdate: string;
  codePostal: string;
  email: string;
  comment: string;
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;
