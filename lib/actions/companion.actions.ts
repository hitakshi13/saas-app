'use server';

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { CreateCompanion, GetAllCompanions } from "@/types/index";
import { revalidatePath } from "next/cache";

// Create a new companion entry
export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({ ...formData, author })
        .select();

    if (error || !data) {
        throw new Error(error?.message || 'Failed to create a companion');
    }

    return data[0];
};

// Get all companions with optional filters and bookmarked status
export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    const { userId } = await auth();
    const supabase = await createSupabaseClient();

    let query = supabase
        .from('companions')
        .select(`
    id, name, topic, subject, duration,
    bookmarks (user_id)
  `);


    if (subject && topic) {
        query = query
            .ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    } else if (subject) {
        query = query.ilike('subject', `%${subject}%`);
    } else if (topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return data.map((companion: any) => ({
        ...companion,
        bookmarked: !!companion.bookmarks?.some((b: any) => b.user_id === userId),
    }));
};

// Get a single companion by ID
export const getCompanion = async (id: string) => {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if (error) {
        console.error(error);
        throw new Error('Failed to fetch companion');
    }

    return data[0];
};

// Add to session history
export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        });

    if (error) throw new Error(error.message);
    return data;
};

// Get recent sessions
export const getRecentSessions = async (limit = 10) => {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
};

// Get user-specific sessions
export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
};

// Get companions created by a specific user
export const getUserCompanions = async (userId: string) => {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId);

    if (error) throw new Error(error.message);

    return data;
};

// Check if user can create a new companion (based on feature/plan limits)
export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    const supabase = await createSupabaseClient();

    let limit = 0;

    if (has({ plan: 'pro' })) {
        return true;
    } else if (has({ feature: "3_companion_limit" })) {
        limit = 3;
    } else if (has({ feature: "10_companion_limit" })) {
        limit = 10;
    }

    const { data, error } = await supabase
        .from('companions')
        .select('id', { count: 'exact' })
        .eq('author', userId);

    if (error) throw new Error(error.message);

    const companionCount = data?.length ?? 0;
    return companionCount < limit;
};

// Add bookmark
export const addBookmark = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;

    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from("bookmarks")
        .insert({
            companion_id: companionId,
            user_id: userId,
        });

    if (error) throw new Error(error.message);

    revalidatePath(path);
    return data;
};

// Remove bookmark
export const removeBookmark = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;

    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("companion_id", companionId)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);

    revalidatePath(path);
    return data;
};

// Get all companions bookmarked by a user
export const getBookmarkedCompanions = async (userId: string) => {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
        .from("bookmarks")
        .select(`companions:companion_id (*)`)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
};
