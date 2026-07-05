export type PublicCompanyProfile = {
  id: string;
  company_slug: string;
  company_logo: string | null;
  company_name: string;
  about_company: string;
  industry: string;
  business_type: string;
  year_established: number | null;
  number_of_employees: string;
  address: string;
  country: string;
  city: string;
  website: string;
  linkedin: string;
  certifications: string[];
  export_markets: string[];
  import_markets: string[];
};
