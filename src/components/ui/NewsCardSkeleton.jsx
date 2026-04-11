export default function NewsCardSkeleton() {
    return (
        <div className="card overflow-hidden animate-skeleton">
            <div className="skeleton h-44 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/3 mt-2" />
                <div className="flex gap-2 mt-4">
                    <div className="skeleton h-8 w-24 rounded-lg" />
                    <div className="skeleton h-8 w-24 rounded-lg" />
                    <div className="skeleton h-8 w-28 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
