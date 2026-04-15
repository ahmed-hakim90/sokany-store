export type ServiceCenter = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  /** Short line under the branch name */
  description?: string;
  /** Shown in the featured card slot */
  featured?: boolean;
  /** Optional deep link to maps */
  mapUrl?: string;
  /** Branch photo for cards */
  imageSrc?: string;
};
