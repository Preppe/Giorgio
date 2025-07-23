interface TodoProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export const TodoProgressBar = ({ completedCount, totalCount }: TodoProgressBarProps) => {
  const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div className="flex-shrink-0 px-4 mb-4">
      <div className="w-full bg-primary/20 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};