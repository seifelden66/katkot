import Image from 'next/image'
// import Link from 'next/link'

interface ProfileHeaderProps {
    profile: {
        avatar_url?: string;
        full_name?: string;
        regions?: {
            name: string;
        };
        bio?: string;
    }
    userPosts: {
        id: string;
        title: string;
        content: string;
        created_at: string;
    }[]
    followerCount: number
    followingCount: number
    isFollowing: boolean
    currentUserId: string | undefined
    userId: string
    handleFollow: (targetUserId?: string) => Promise<void>
    setView: (view: "none" | "followers" | "following") => void
}

export default function ProfileHeader({
    profile,
    userPosts,
    followerCount,
    followingCount,
    isFollowing,
    currentUserId,
    userId,
    handleFollow,
    setView
}: ProfileHeaderProps) {
    return (
        <div className="rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
                    <div>
                        {profile.avatar_url ? (
                            // profile.avatar_url.includes('bing.com') ? (
                            //     <img
                            //         src={profile.avatar_url}
                            //         alt="Profile picture"
                            //         width={96}
                            //         height={96}
                            //         className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
                            //     />
                            // ) : (
                            //     <Image
                            //         src={profile.avatar_url}
                            //         alt="dsa"
                            //         width={96}
                            //         height={96}
                            //         className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
                            //     />
                            // )
                            <Image
                                    src={profile.avatar_url}
                                    alt="dsa"
                                    width={96}
                                    height={96}
                                    className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm"
                                />

                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-white shadow-sm">
                                {profile.full_name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold mb-1">
                            {profile.full_name || 'User'}
                        </h1>

                        {profile.regions && (
                            <div className="mb-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                                    {profile.regions.name}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                            <div className="text-center">
                                <span className="block text-xl font-bold">{userPosts.length}</span>
                                <span className="text-sm text-gray-500">Posts</span>
                            </div>
                            <div className="cursor-pointer text-center" onClick={() => setView("followers")}>
                                <span className="block text-xl font-bold">{followerCount}</span>
                                <span className="text-sm text-gray-500">Followers</span>
                            </div>
                            <div className="text-center cursor-pointer" onClick={() => setView("following")}>
                                <span className="block text-xl font-bold">{followingCount}</span>
                                <span className="text-sm text-gray-500">Following</span>
                            </div>
                        </div>
                        {currentUserId && currentUserId !== userId && (
                            <button
                                onClick={() => handleFollow()}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing
                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                                    }`}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>

                {profile.bio && (
                    <p className="text-gray-700 mb-4">{profile.bio}</p>
                )}
            </div>
        </div>
    )
}