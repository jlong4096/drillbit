"use client";

import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, Hammer, User } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatInterface from "@/components/ChatInterface";
import Profile from "@/components/Profile";

const client = new QueryClient();

interface SidebarNavItemProps {
  icon: ReactNode;
  text: string;
  isExpanded: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const SidebarNavItem = ({
  icon,
  text,
  isExpanded,
  isSelected,
  onClick,
}: SidebarNavItemProps) => {
  return (
    <div
      className={`relative flex items-center px-4 py-2 text-gray-700 hover:cursor-pointer hover:bg-gray-50 group ${
        isSelected ? "bg-gray-100" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-5">{icon}</div>
      <span
        className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        {text}
      </span>
      {!isExpanded && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {text}
        </div>
      )}
    </div>
  );
};

interface SidebarNavProps {
  vendors: [string, string][];
}

const SidebarNav = ({ vendors }: SidebarNavProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`relative bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-64" : "w-16"
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute z-10 -right-3 top-6 p-1 bg-white border border-gray-300 rounded-full shadow-sm text-gray-300 transition-all duration-100 ease-in-out hover:bg-gray-50 hover:border-gray-500 hover:text-gray-500"
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <div className="py-6 z-0">
          <nav className="space-y-1">
            <SidebarNavItem
              icon={<User className="w-5 h-5" />}
              text="Profile"
              isExpanded={isExpanded}
              isSelected={selectedVendor === null}
              onClick={() => setSelectedVendor(null)}
            />

            <div className="px-4 py-2">
              <div className="h-px bg-gray-200" />
            </div>

            <div
              className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-opacity duration-300 ${
                isExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              Reviews
            </div>

            {vendors.map(([id, name]) => (
              <SidebarNavItem
                key={id}
                icon={<Hammer className="w-5-h-5" />}
                text={name}
                isExpanded={isExpanded}
                isSelected={selectedVendor === id}
                onClick={() => setSelectedVendor(id)}
              />
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8">
        <div className="flex flex-col items-center justify-between">
          {selectedVendor !== null ? (
            <ChatInterface vendorId={selectedVendor} />
          ) : (
            <QueryClientProvider client={client}>
              <Profile />
            </QueryClientProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
