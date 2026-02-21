import { z } from "zod";

// Character limits for each field
export const CHAR_LIMITS = {
  firstName: 10,
  lastName: 10,
  email: 50,
  phoneNumber: 16,
  address: 100,
  county: 20,
  postcode: 4,
  school: 20,
  dateOfBirth: 10,
  correspondenceLanguage: 2,
} as const;

// Base schemas
export const firstNameSchema = z
  .string()
  .trim()
  .min(1, "Voer een geldige voornaam in")
  .max(
    CHAR_LIMITS.firstName,
    `Voornaam mag maximaal ${CHAR_LIMITS.firstName} tekens bevatten`,
  )
  .refine((val: string) => !/^\d+$/.test(val), {
    message: "Voornaam mag niet alleen uit cijfers bestaan",
  });

export const lastNameSchema = z
  .string()
  .trim()
  .min(1, "Voer een geldige achternaam in")
  .max(
    CHAR_LIMITS.lastName,
    `Achternaam mag maximaal ${CHAR_LIMITS.lastName} tekens bevatten`,
  )
  .refine((val: string) => !/^\d+$/.test(val), {
    message: "Achternaam mag niet alleen uit cijfers bestaan",
  });

export const emailSchema = z
  .email("Voer een geldig e-mailadres in")
  .max(
    CHAR_LIMITS.email,
    `E-mailadres mag maximaal ${CHAR_LIMITS.email} tekens bevatten`,
  );

export const phoneSchemaInternational = z
  .string()
  .trim()
  .min(1, "Voer een geldig telefoonnummer in")
  .max(
    CHAR_LIMITS.phoneNumber,
    `Telefoonnummer mag maximaal ${CHAR_LIMITS.phoneNumber} tekens bevatten`,
  )
  .refine(
    (val: string) => {
      const normalized = val.replace(/[^+0-9]/g, "");
      return /^\+32[0-9]{8,12}$/.test(normalized);
    },
    {
      message:
        "Voer een geldig internationaal telefoonnummer in (+32 123 45 67 89)",
    },
  );

export const phoneSchemaNational = z
  .string()
  .trim()
  .min(1, "Voer een geldig telefoonnummer in")
  .max(
    CHAR_LIMITS.phoneNumber,
    `Telefoonnummer mag maximaal ${CHAR_LIMITS.phoneNumber} tekens bevatten`,
  )
  .refine(
    (val: string) => {
      const normalized = val.replace(/[^+0-9]/g, "");
      return /^04[0-9]{8}$/.test(normalized);
    },
    { message: "Voer een geldig nationaal telefoonnummer in (bv. 0470123456)" },
  );

export const addressSchema = z
  .string()
  .trim()
  .min(1, "Voer een geldig adres in")
  .max(
    CHAR_LIMITS.address,
    `Adres mag maximaal ${CHAR_LIMITS.address} tekens bevatten`,
  );

export const countySchema = z
  .string()
  .trim()
  .min(1, "Voer een geldige gemeente in")
  .max(
    CHAR_LIMITS.county,
    `Gemeente mag maximaal ${CHAR_LIMITS.county} tekens bevatten`,
  )
  .refine((val: string) => !/^\d+$/.test(val), {
    message: "Gemeente mag niet alleen uit cijfers bestaan",
  });

export const postcodeSchema = z
  .string()
  .trim()
  .min(1, "Voer een geldige postcode in")
  .refine(
    (val: string) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1000 && num <= 9999;
    },
    { message: "Voer een geldige postcode in (1000-9999)" },
  );

export const schoolSchema = z
  .string()
  .trim()
  .min(1, "Voer een geldige schoolnaam in")
  .max(
    CHAR_LIMITS.school,
    `Schoolnaam mag maximaal ${CHAR_LIMITS.school} tekens bevatten`,
  );

export const dateOfBirthSchema = z
  .string()
  .trim()
  .regex(
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    "Voer een geldige geboortedatum in (DD/MM/JJJJ)",
  )
  .refine(
    (val) => {
      const [day, month, year] = val.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      return (
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year &&
        date < new Date() && // Must be in the past
        date > new Date(1900, 0, 1) // Reasonable lower bound
      );
    },
    { message: "Voer een geldige geboortedatum in" },
  );

export const correspondenceLanguageSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((val) => ["NL", "EN"].includes(val), {
    message: "Voer 'NL' of 'EN' in",
  });
