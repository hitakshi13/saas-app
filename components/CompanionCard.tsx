"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { addBookmark, removeBookmark } from "@/lib/actions/companion.actions";
import { useRouter } from "next/navigation";

interface CompanionCardProps {
    id: string;
    name: string;
    topic: string;
    subject: string;
    duration: number;
    color: string;
    bookmarked: boolean;
}

const CompanionCard = ({
                           id,
                           name,
                           topic,
                           subject,
                           duration,
                           color,
                           bookmarked: initiallyBookmarked,
                       }: CompanionCardProps) => {
    const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const toggleBookmark = () => {
        startTransition(async () => {
            try {
                if (bookmarked) {
                    await removeBookmark(id, "/");
                } else {
                    await addBookmark(id, "/");
                }
                setBookmarked(!bookmarked);
                // router.refresh(); // Optional: uncomment if needed
            } catch (error) {
                console.error("Failed to toggle bookmark:", error);
            }
        });
    };

    return (
        <article className="companion-card" style={{ backgroundColor: color }}>
            <div className="flex justify-between items-center">
                <div className="subject-badge">{subject}</div>
                <button
                    className="companion-bookmark disabled:opacity-50"
                    onClick={toggleBookmark}
                    disabled={isPending}
                >
                    <Image
                        src={bookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
                        alt="bookmark"
                        width={16}
                        height={16}
                    />
                </button>
            </div>

            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-sm">{topic}</p>

            <div className="flex items-center gap-2">
                <Image src="/icons/clock.svg" alt="duration" width={14} height={14} />
                <p className="text-sm">{duration} minutes</p>
            </div>

            <Link href={`/companions/${id}`} className="w-full">
                <button className="btn-primary w-full justify-center">Launch Lesson</button>
            </Link>
        </article>
    );
};

export default CompanionCard;
