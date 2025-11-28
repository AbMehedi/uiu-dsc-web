// Type definitions for database models

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  seats: number;
  description: string;
  imageUrl?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  category: string;
  email?: string;
  imageUrl?: string;
}

export interface Partner {
  id: number;
  name: string;
  description: string;
  benefits: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface Question {
  id: number;
  category: string;
  subcategory: string;
  title: string;
  link: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  studentId: string;
  department: string;
  semester: string;
  phone?: string;
  joinedAt: string;
}
