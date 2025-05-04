interface HeaderProps {
  isConnected: boolean;
  onConnect: () => void;
  account: string | null;
}

export const Header = ({ isConnected, onConnect, account }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">
            <span className="text-primary">Grid</span>otto
          </h2>
        </div>
        
        <div>
          {isConnected && account ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="bg-primary px-4 py-2 rounded-lg hover:bg-opacity-80 transition text-white"
            >
              Connect UP
            </button>
          )}
        </div>
      </div>
    </header>
  );
}; 