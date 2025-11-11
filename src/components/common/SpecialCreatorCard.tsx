import { Crown, Heart, UserCheck, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Creator } from "@/features/top/types";
import { useAuth } from "@/providers/AuthContext";
import { useEffect, useState } from "react";

interface SpecialCreatorCardProps {
    creator: Creator;
    showRank?: boolean;
    showFollowButton?: boolean;
    onCreatorClick: (username: string) => void;
    onFollowClick: (isFollowing: boolean, creatorId: string) => void;
}

export default function SpecialCreatorCard({
    creator,
    showRank = true,
    showFollowButton = true,
    onCreatorClick,
    onFollowClick,
}: SpecialCreatorCardProps) {
    const { user } = useAuth();
    const [isSelf, setIsSelf] = useState(false);

    useEffect(() => {
        if (!user) return setIsSelf(false);
        setIsSelf(user.id === creator.id);
    }, [user]);

    return (
        <div className="w-full max-w-3xl mx-auto bg-white shadow-sm border border-black/5 overflow-hidden">
            {/* cover */}
            <div className="relative w-full h-48 md:h-64">
                {showRank && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        #{creator.rank}
                    </div>
                )}

                <img
                    src={creator.cover || "/assets/default-cover.jpg"}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                />
                <button
                    type="button"
                    onClick={() => onCreatorClick(creator.username)}
                    className="absolute left-1/2 -bottom-12 -translate-x-1/2"
                >
                    <div className="relative">
                        <img
                            src={creator.avatar || "/assets/no-image.svg"}
                            alt={creator.name}
                            className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
                            <span className="text-white text-lg">✓</span>
                        </div>
                    </div>
                </button>
            </div>

            {/* info */}
            <div className="pt-16 pb-6 px-4 md:px-8 text-center">
                <button
                    type="button"
                    onClick={() => onCreatorClick(creator.username)}
                    className="w-full"
                >
                    <p className="text-lg md:text-xl font-semibold text-gray-900">
                        {creator.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{creator.username}</p>
                </button>

                <div className="mt-3 flex items-center justify-center gap-3 text-xs md:text-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-400">
                            {creator.likes?.toLocaleString()} いいね
                        </span>
                    </div>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-400">
                        {creator.followers?.toLocaleString()} フォロワー
                    </span>
                </div>

                {!isSelf && (
                    <div className="mt-5 flex justify-center">
                        <Button
                            variant="subscribe"
                            size="lg"
                            onClick={() => onFollowClick(creator.is_following, creator.id)}
                            disabled={showFollowButton}
                        >
                            {creator.is_following ? (
                                <>
                                    <UserCheck className="h-4 w-4" />
                                    フォロー中
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    フォロー
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
