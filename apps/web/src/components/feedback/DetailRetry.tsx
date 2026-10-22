interface DetailRetryProps {
  onRetry: () => void;
}

export function DetailRetry({ onRetry }: DetailRetryProps) {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-roboto text-base text-white sm:text-lg">
        This title could not be loaded.
      </p>
      <button
        type="button"
        className="rounded-lg bg-[#f5c518] px-6 py-3 font-semibold text-black hover:bg-[#e6b800]"
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}
