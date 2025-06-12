enum Subject {
  maths = "maths",
  language = "language",
  science = "science",
  history = "history",
  coding = "coding",
  geography = "geography",
  economics = "economics",
  finance = "finance",
  business = "business",
}

// Companion item as returned by Supabase
type Companion = {
  id: string;
  name: string;
  subject: Subject;
  topic: string;
  duration: number;
  bookmarked: boolean;
  author?: string; // assuming you store user id of creator
  voice?: string;
  style?: string;
  created_at?: string;
};

// Used when creating a new companion
interface CreateCompanion {
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
}

// Used when querying companions with filters/pagination
interface GetAllCompanions {
  limit?: number;
  page?: number;
  subject?: string | string[];
  topic?: string | string[];
}

// Used when creating client session
interface BuildClient {
  key?: string;
  sessionToken?: string;
}

// User account creation
interface CreateUser {
  email: string;
  name: string;
  image?: string;
  accountId: string;
}

// For extracting search params from URL
interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Avatar display
interface Avatar {
  userName: string;
  width: number;
  height: number;
  className?: string;
}

// Chat message structure
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

// Props to render a companion card/component
interface CompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  name: string;
  userName: string;
  userImage: string;
  voice: string;
  style: string;
}
