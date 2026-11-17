const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="relative flex flex-col items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-t-transparent border-[#1976d2] rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-t-transparent border-[#1976d2]/80 rounded-full animate-spin-slow" />
          <div className="absolute inset-4 border-4 border-t-transparent border-[#1976d2]/60 rounded-full animate-spin-slower" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
